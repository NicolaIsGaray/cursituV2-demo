import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from '../../../models/subject.model';
import { SubjectService } from '../../../services/subject.service';
import { filter, map, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { Assignment } from '../../../models/assignment.model';
import { AssignmentService } from '../../../services/assignment.service';
import { QuillEditorComponent } from 'ngx-quill';
import { Submission } from '../../../models/submission.model';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-send-task',
  imports: [CommonModule, RouterModule, QuillEditorComponent, ReactiveFormsModule],
  templateUrl: './send-task.html',
  styleUrl: './send-task.css',
})
export class SendTask implements OnInit {
  submissionDate!: Date;
  submissionTimeStatus: 'A término' | 'Fuera de término' = 'A término';
  submissionText: string = '';
  submissionComment: string = '';
  selectedFile: File | null = null;

  subjectId: string | null = null;
  currentSubject$!: Observable<Subject>;

  activityId: string | null = null;
  currentActivity$!: Observable<Assignment>;

  newSubmit!: Submission;

  submitForm!: FormGroup;
  submissionStatus$!: Observable<string>;

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'clean'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
    ],
  };

  constructor(
    private subjectService: SubjectService,
    private assignmentService: AssignmentService,
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.activityId = this.activeRoute.snapshot.paramMap.get('id');
    this.loadSubmissionStatus();

    if (this.activityId) {
      this.currentActivity$ = this.assignmentService.getAssignmentById(this.activityId).pipe(
        tap((activity) => {
          if (activity) {
            this.subjectId = activity.subject_id;
          }
        }),
        shareReplay(1),
      );

      this.currentSubject$ = this.currentActivity$.pipe(
        filter((activity) => !!activity),
        switchMap((activity) => this.subjectService.getSubjectById(activity.subject_id)),
        tap((subject) => {
          if (subject?.color) {
            document.documentElement.style.setProperty('--subject-color', subject.color);
          }
        }),
        shareReplay(1),
      );
    } else {
      console.error('No se encontró el ID de la actividad en la ruta.');
    }
  }

  initForm() {
    this.submitForm = this.fb.group({
      comment: [''],
    });
  }

  private loadSubmissionStatus(): void {
    this.submissionStatus$ = this.assignmentService
      .checkSubmissionStatus(this.authService.currentUserValue?.id!, this.activityId!)
      .pipe(
        map((res) => res.status),
      );
  }

  formatDateDisplay(original: Date | string): string {
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
    formattedDate = formattedDate.replace(/\./g, '').toUpperCase();

    return formattedDate;
  }

  isDeliveryOpen(dateLimitStr: Date): boolean {
    const limit = new Date(dateLimitStr);
    return new Date() <= limit;
  }

  sendActivity(activity: Assignment) {
    this.submissionDate = new Date();
    const limit = new Date(activity.date_limit);

    this.submissionTimeStatus = this.submissionDate <= limit ? 'A término' : 'Fuera de término';

    const timezoneOffsetOffset = this.submissionDate.getTimezoneOffset() * 60000;

    const localISODate = new Date(
      this.submissionDate.getTime() - timezoneOffsetOffset,
    ).toISOString();

    const formattedDate = localISODate.split('.')[0];

    const { comment } = this.submitForm.value;

    this.newSubmit = {
      comment: comment,
      file_url: 'google.com',
      submission_date: formattedDate,
    };

    this.assignmentService
      .submitActivity(this.activityId!, this.authService.currentUserValue?.id!, this.newSubmit)
      .subscribe({
        next: () => {
          alert('Actividad Entregada Exitosamente.');
          this.submitForm.reset();
          this.loadSubmissionStatus();
        },
        error: (err) => console.error('Hubo un error al entregar la actividad: ', err),
      });
  }

  triggerFileInput() {
    alert('Simulación de carga de archivo.');
  }

  goBack() {
    this.location.back();
  }
}
