import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AssignmentService } from '../../../services/assignment.service';
import { SubjectService } from '../../../services/subject.service';
import { Classroom } from '../../../models/classroom.model';
import { Observable, take, tap } from 'rxjs';
import { TeacherSubmissionDTO } from '../../../models/dto/teacher-submissionDTO';
import { Subject } from '../../../models/subject.model';
import { FormsModule } from '@angular/forms';
import { TopicService } from '../../../services/topic.service';
import { Assignment } from '../../../models/assignment.model';

@Component({
  selector: 'app-see-deliveries',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './see-deliveries.html',
  styleUrl: './see-deliveries.css',
})
export class SeeDeliveries implements OnInit {
  subjectId: string | null = null;
  assignmentId: string | null = null;

  currentClassroom!: Classroom;
  currentAssignment$!: Observable<Assignment>;
  currentSubject$!: Observable<Subject>;

  submissionList$!: Observable<TeacherSubmissionDTO[]>;

  private readonly SUBJECT_KEY = 'cursitu_selected_subject';
  private readonly TOPIC_KEY = 'cursitu_selected_topic';

  constructor(
    public authService: AuthService,
    private location: Location,
    private assignmentService: AssignmentService,
    private subjectService: SubjectService,
    private topicService: TopicService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subjectId = localStorage.getItem(this.SUBJECT_KEY)!.replace(/"/g, '');

    this.loadSubject();
  }

  loadSubject() {
    this.currentSubject$ = this.subjectService.getSubjectById(this.subjectId!);

    this.loadClassroom();
    this.getTopic();
  }

  getTopic() {
    const topicId = this.topicService.getTopicFromStorage();
    this.topicService
      .getTopicById(topicId!)
      .subscribe({
        next: (topic) => {
          this.currentAssignment$ = this.assignmentService
            .getAssignmentById(topic.assignmentId!)
            .pipe(
              take(1),
              tap((assignment: Assignment) => {
                this.assignmentId = assignment.id!;
                this.loadTable();
              }),
            );
        },
        error: (err) => console.error('Hubo un error al intentar obtener la clase: ', err),
      });
  }

  loadClassroom() {
    this.subjectService.getClassroomInSubject(this.subjectId!).subscribe({
      next: (data) => {
        this.currentClassroom = data;
      },
      error: (err) => console.error('Hubo un problema al intentar obtener el curso: ', err),
    });
  }

  loadTable() {
    this.submissionList$ = this.assignmentService.getStudentSubmissions(
      this.currentClassroom.id!,
      this.assignmentId!,
    );
    
    this.cdr.detectChanges();
  }

  saveGrade(item: TeacherSubmissionDTO) {
    this.assignmentService.saveOrUpdateGrade(item.studentId, this.assignmentId!, item.grade!).subscribe({
      next: () => {
        alert("Nota Actualizada Exitosamente.");
      },
      error: (err) => console.error("Hubo un problema al cargar la nota: ", err)
    })
  }

  formatDate(original: Date | string): string {
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
    return formattedDate.replace(/\./g, '');
  }

  validateKeyboard(event: KeyboardEvent): void {
    if (['+', '-'].includes(event.key)) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    if (
      input.value.length >= 2 &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)
    ) {
      event.preventDefault();
    }
  }

  getFileName(fileUrl: string): string {
    return fileUrl ? fileUrl.split('/').pop() || 'Archivo_Adjunto' : '';
  }

  downloadFile(url: string) {
    window.location.href = url;
  }

  goBack() {
    this.location.back();
  }
}
