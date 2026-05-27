import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../models/subject.model';
import { Observable, take, tap } from 'rxjs';
import { Assignment } from '../../../models/assignment.model';
import { AssignmentService } from '../../../services/assignment.service';
import { Classroom } from '../../../models/classroom.model';
import { TeacherSubmissionDTO } from '../../../models/dto/teacher-submissionDTO';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';

interface FilterChip {
  label: string;
  value: string;
}

@Component({
  selector: 'app-manage-grades',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './manage-grades.html',
  styleUrl: './manage-grades.css',
})
export class ManageGrades implements OnInit {
  subjectId: string | null = null;
  activityId: string | null = null;

  currentSubject$!: Observable<Subject>;
  classroomData$!: Observable<Classroom>;
  activityList$!: Observable<Assignment[]>;
  gradesList$!: Observable<TeacherSubmissionDTO[]>;

  currentClassroomId!: string;
  filterOptions: FilterChip[] = [];
  selectedFilter!: string;

  constructor(
    public authService: AuthService,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private subjectService: SubjectService,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit(): void {
    this.subjectId = this.subjectService.getItemFromStorage();

    if (!this.subjectId) {
      console.error('No se encontró un ID de materia.');
      return;
    }

    this.currentSubject$ = this.subjectService.getSubjectById(this.subjectId).pipe(
      tap((subject: Subject) => {
        document.documentElement.style.setProperty('--subject-color', subject.color);
      }),
    );

    this.subjectService
      .getClassroomInSubject(this.subjectId)
      .pipe(take(1))
      .subscribe({
        next: (classroom: Classroom) => {
          this.currentClassroomId = classroom.id!;

          this.loadActivities();
        },
        error: (err) => console.error('Error al obtener el aula:', err),
      });
  }

  loadActivities(): void {
    this.assignmentService
      .getAssignmentsInSubject(this.subjectId!)
      .pipe(
        take(1),
      )
      .subscribe({
        next: (assignments: Assignment[]) => {
          console.log(assignments);
          
          this.generateDynamicFilters(assignments);
        },
        error: (err) => console.error('Error crítico al solicitar actividades al servicio:', err),
      });
  }

  private generateDynamicFilters(assignments: Assignment[]): void {
    this.filterOptions = [];
    let tpCounter = 1;
    let examCounter = 1;

    assignments.forEach((activity) => {
      if (activity.subject_id !== this.subjectId) {
        console.log("[DEBUG] Actividad Materia ID: ", activity.subject_id);
        console.log("[DEBUG] Materia Seleccionada ID: ", this.subjectId);
        
      }

      let labelName = '';
      this.activityId = activity.id!;

      if (activity.type?.toLowerCase() === 'tarea') {
        labelName = `TP ${tpCounter++}`;
      } else if (activity.type?.toLowerCase() === 'parcial') {
        labelName = `Parcial ${examCounter++}`;
      } else {
        labelName = activity.title;
      }

      this.filterOptions.push({
        label: labelName,
        value: activity.id!,
      });
    });

    if (this.filterOptions.length > 0) {
      this.selectFilter(this.filterOptions[0].label, this.filterOptions[0].value);
    }

    this.cdr.detectChanges();
  }

  selectFilter(filterLabel: string, activityId: string): void {
    this.selectedFilter = activityId;
    this.applyFilter(activityId);
  }

  private applyFilter(activityId: string): void {
    if (!this.currentClassroomId) {
      console.warn('Intentando filtrar sin un ID de aula válido.');
      return;
    }
    this.gradesList$ = this.assignmentService.getStudentSubmissions(
      this.currentClassroomId,
      activityId,
    );
  }

  saveGrade(item: TeacherSubmissionDTO) {
    this.assignmentService.saveOrUpdateGrade(item.studentId, this.activityId!, item.grade!).subscribe({
      next: () => {
        alert("Nota Actualizada Exitosamente.");
      },
      error: (err) => console.error("Hubo un problema al cargar la nota: ", err)
    })
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

  goBack(): void {
    this.location.back();
  }
}
