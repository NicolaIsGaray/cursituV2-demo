import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../../models/user.model';
import { NoticeService } from '../../../services/notice.service';
import { Observable } from 'rxjs';
import { Notice } from '../../../models/notice.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-my-notices',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, QuillEditorComponent],
  templateUrl: './my-notices.html',
  styleUrl: './my-notices.css',
})
export class MyNotices implements OnInit {
  mode: 'crear' | 'editar' = 'crear';
  userData!: User;

  noticeList$!: Observable<Notice[]>;
  noticeToEditId!: string;

  noticeForm!: FormGroup;

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'clean'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
    ],
  };

  constructor(
    public authService: AuthService,
    private route: Router,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private fb: FormBuilder,
    private noticeService: NoticeService,
  ) {}

  ngOnInit(): void {
    this.userData = this.authService.currentUserValue!;

    this.loadProfessorNotices();
    this.initForm();
  }

  initForm() {
    this.noticeForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  loadProfessorNotices() {
    this.noticeList$ = this.noticeService.getSenderNotices(this.userData.id!);
  }

  onSubmit() {
    if (this.noticeForm.invalid) return;

    const { title, content } = this.noticeForm.value;

    const todayDate = new Date().toISOString().split('T')[0];

    const payload: Notice = {
      title: title.trim(),
      message: content,
      senderId: this.userData.id!,
      created_at: todayDate,
      type: 'info',
    };

    if (this.mode === 'crear') {
      this.noticeService.createNotice(payload).subscribe({
        next: () => {
          alert('Anuncio Publicado Exitosamente.');
          this.refreshModules();
        },
        error: (err) => console.error('Hubo un problema al intentar crear el anuncio: ', err),
      });
    } else if (this.mode === 'editar') {
      this.noticeService.modifyNotice(this.noticeToEditId, payload).subscribe({
        next: () => {
          alert('Anuncio Modificado Exitosamente.');
          this.refreshModules();
        },
      });
    }
  }

  noticeToEdit(notice: Notice) {
    this.mode = 'editar';
    this.noticeToEditId = notice.id!;

    this.noticeForm.patchValue({
      title: notice.title,
      content: notice.message,
    });
  }

  deleteNotice(noticeId: string) {
    const confirmation = confirm("Estas por eliminar este anuncio ¿Proceder?");

    if (confirmation) {
      this.noticeService.deleteNotice(noticeId).subscribe({
        next: () => {
          alert("Anuncio Eliminado Exitosamente.");
          this.refreshModules();
        },
        error: (err) => console.error("Hubo un problema al intentar eliminar el anuncio: ", err)
      })
    }
  }

  refreshModules() {
    this.mode = 'crear';

    this.noticeForm.reset();
    this.loadProfessorNotices();
    this.cdr.detectChanges();
  }

  formatDate(original: Date | string): string {
    if (!original) return 'SIN FECHA';
    const date = new Date(original);
    const formatter = new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let formattedDate = formatter.format(date);
    formattedDate = formattedDate.replace(/,/g, '');
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    formattedDate = formattedDate.replace(
      /(\bde\s)(\w)/g,
      (match, p1, p2) => p1 + p2.toUpperCase(),
    );
    return formattedDate.replace(/\./g, '');
  }

  redirectToNotice(id: string) {
    this.route.navigate(["/notices", id])
  }

  goBack() {
    this.location.back();
  }
}
