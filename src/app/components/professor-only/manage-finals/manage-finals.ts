import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subject } from '../../../models/subject.model';
import { catchError, Observable, of, take, tap } from 'rxjs';
import { SubjectService } from '../../../services/subject.service';
import { ClassroomService } from '../../../services/classroom.service';
import { ExamDTO } from '../../../models/dto/examDTO';
import { Assignment } from '../../../models/assignment.model';
import { FormsModule } from '@angular/forms';
import { TeacherSubmissionDTO } from '../../../models/dto/teacher-submissionDTO';
import { AssignmentService } from '../../../services/assignment.service';

@Component({
  selector: 'app-manage-finals',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './manage-finals.html',
  styleUrl: './manage-finals.css',
})
export class ManageFinals implements OnInit {
  subjectId: string | null = null;
  currentSubject!: Subject;

  examsList$!: Observable<Assignment[]>;

  selectedExamDetails$!: Observable<ExamDTO | null>;
  selectedExamId: string | null = null;

  examType: string = 'VIRTUAL';

  constructor(
    public authService: AuthService,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private subjectService: SubjectService,
    private classroomService: ClassroomService,
    private assignmentService: AssignmentService,
  ) {}

  ngOnInit(): void {
    this.getCurrentSubject();
  }

  getCurrentSubject() {
    this.subjectId = this.subjectService.getItemFromStorage();

    this.subjectService.getSubjectById(this.subjectId!).subscribe({
      next: (data) => {
        this.currentSubject = data;
        document.documentElement.style.setProperty('--subject-color', this.currentSubject.color);
        this.loadExams();
      },
      error: (err) => console.error('Hubo un problema al obtener la materia: ', err),
    });
  }

  loadExams(): void {
    this.examsList$ = this.classroomService
      .obtainClassroomExams(this.currentSubject.classroom_id!)
      .pipe(
        take(1),
        tap((assignments: Assignment[]) => {
          const filteredExams = assignments.filter(
            (a) => a.type?.toLowerCase() === 'parcial' || a.type?.toLowerCase() === 'final',
          );
          if (filteredExams.length > 0) {
            this.selectExam(filteredExams[0].id!);
          }
        }),
      );
    this.cdr.detectChanges();
  }

  selectExam(examId: string): void {
    this.selectedExamId = examId;

    this.selectedExamDetails$ = this.classroomService
      .getExamDetails(this.currentSubject.classroom_id!, examId, this.examType)
      .pipe(
        catchError((err) => {
          console.error('Error al cargar la planilla del parcial:', err);
          return of(null);
        }),
      );

    this.cdr.detectChanges();
  }

  saveGrade(student: TeacherSubmissionDTO, activityId: string): void {
    if (student.grade! < 0 || student.grade! > 10) {
      alert('La nota debe estar comprendida entre 0 y 10.');
      return;
    }

    this.assignmentService
      .saveOrUpdateGrade(student.studentId, activityId, student.grade!)
      .subscribe({
        next: () => {
          console.log(`Nota impactada con éxito para ${student.studentName}`);
        },
        error: (err) => {
          console.error('Error crítico al intentar guardar la calificación en el servidor:', err);
          alert('No se pudo guardar la nota. Revisá la consola.');
        },
      });
  }

  formatDate(original: Date | string): string {
    if (!original) return '-';
    const date = new Date(original);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  goBack() {
    this.location.back();
  }
}
