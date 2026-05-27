import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { catchError, Observable, of, take, tap } from 'rxjs';
import { Subject } from '../../../models/subject.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubjectService } from '../../../services/subject.service';

@Component({
  selector: 'app-edit-subject',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './edit-subject.html',
  styleUrl: './edit-subject.css',
})
export class EditSubject implements OnInit {
  subjectId: string | null = null;
  currentSubject$!: Observable<Subject>;
  subjectForm!: FormGroup;

  constructor(
    public authService: AuthService,
    private location: Location,
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.subjectId = this.subjectService.getItemFromStorage();

    if (!this.subjectId) {
      console.error('No se encontró el ID de la materia en el storage.');
      return;
    }

    this.currentSubject$ = this.subjectService.getSubjectById(this.subjectId).pipe(
      tap((subject) => {
        if (subject) {
          this.subjectForm.patchValue({
            name: subject.subject_name,
            color: subject.color,
          });

          this.cdr.detectChanges();
        }
      }),
      catchError((err) => {
        console.error('Error al obtener la materia desde el servicio:', err);
        return of({} as Subject);
      }),
    );
  }

  initForm() {
    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      color: ['', Validators.required],
    });
  }

  OnSubmit() {
    if (this.subjectForm.invalid) {
      return;
    }

    const { name, color } = this.subjectForm.value;

    this.currentSubject$.pipe(take(1)).subscribe((subject) => {
      if (!subject || !subject.id) {
        console.error('No se puede actualizar una materia sin un ID válido.');
        return;
      }

      const updatedSubject: Subject = {
        ...subject,
        subject_name: name,
        color: color,
      };

      this.subjectService
        .modifySubject(subject.id, updatedSubject)
        .pipe(take(1))
        .subscribe({
          next: () => {
            alert('Materia modificada con éxito.');
            this.goBack();
          },
          error: (err) => console.error('Hubo un error al intentar cambiar el color: ', err),
        });
    });
  }

  goBack() {
    this.location.back();
  }
}
