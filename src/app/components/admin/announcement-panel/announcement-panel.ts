import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { AuthService } from '../../../services/auth.service';
import { NoticeService } from '../../../services/notice.service';
import { Notice } from '../../../models/notice.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-announcement-panel',
  imports: [CommonModule, QuillEditorComponent, ReactiveFormsModule],
  templateUrl: './announcement-panel.html',
  styleUrl: './announcement-panel.css',
})
export class AnnouncementPanel implements OnInit{
  modo: 'crear' | 'eliminar' | null = null;

  announcementForm!: FormGroup;

  newNotice: Notice = new Notice();
  noticeToDeleteSel!: Notice;
  noticeList$!: Observable<Notice[]>;

  emisorId: string | null = null;

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'clean'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link']
    ]
  }

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private noticeService: NoticeService
  ) {}

  ngOnInit(): void {
    this.noticeList$ = this.noticeService.getAllNotices();

    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      body: ['', Validators.required]
    })
  }

  setEmisorData() {
    this.emisorId = this.authService.currentUserValue?.id!;
  }

  onSubmit() {
    if (this.announcementForm.invalid) return;

    this.setEmisorData();

    const { title, type, body } = this.announcementForm.value;

    const todayDate = new Date().toISOString().split('T')[0];

    this.newNotice = {
      title: title.trim(),
      type: type,
      message: body,
      senderId: this.emisorId!,
      created_at: todayDate
    }

    console.log("Datos a enviar: ", this.newNotice);

    this.submitNotice();
  }

  submitNotice() {
    this.noticeService.createNotice(this.newNotice).subscribe({
      next: () => {
        alert("Aviso Creado Exitosamente.");
        window.location.reload();
      },
      error: (err) => console.error("Hubo un error al crear el aviso: ", err)
    })
  }

  selectNoticeToDelete(e: Event) {
    const element = e.target as HTMLSelectElement;
    const value = element.value;

    this.noticeService.getNoticeById(value).subscribe({
      next: (data) => {
        this.noticeToDeleteSel = data;
      }
    })
  }

  deleteNotice(): void {
    if (!this.noticeToDeleteSel) return;

    const confirmation = confirm(
      `¿Estás seguro de borrar este anuncio?`
    )

    if (confirmation) {
      this.noticeService.deleteNotice(this.noticeToDeleteSel.id!).subscribe({
        next: () => {
          alert("Anuncio Borrado Exitosamente.");
          window.location.reload();
        },
        error: (err) => console.error("Hubo un problema al intentar borrar el anuncio: ", err)
      })
    }
  }

  cambiarModo(nuevoModo: 'crear' | 'eliminar') {
    this.modo = nuevoModo;
  }
}
