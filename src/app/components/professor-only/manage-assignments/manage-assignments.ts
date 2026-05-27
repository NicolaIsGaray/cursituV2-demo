import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../models/subject.model';
import { Observable, take, tap } from 'rxjs';
import { Assignment } from '../../../models/assignment.model';
import { AssignmentService } from '../../../services/assignment.service';
import { ClassroomService } from '../../../services/classroom.service';
import { TaskStatsDTO } from '../../../models/dto/task-statsDTO';

@Component({
  selector: 'app-manage-tasks',
  imports: [RouterModule, CommonModule],
  templateUrl: './manage-assignments.html',
  styleUrl: './manage-assignments.css',
})
export class ManageAssignments implements OnInit {
  subjectId: string | null = null;
  currentSubject!: Subject;

  taskList$!: Observable<Assignment[] | null>;
  taskStats$!: Observable<TaskStatsDTO>;

  constructor(
    public authService: AuthService,
    private subjectService: SubjectService,
    private assignmentService: AssignmentService,
    private classroomService: ClassroomService,
    private cdr: ChangeDetectorRef,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.getCurrentSubject();
  }

  getCurrentSubject() {
    this.subjectId = this.subjectService.getItemFromStorage();

    this.subjectService.getSubjectById(this.subjectId!).subscribe({
      next: (data) => {
        this.currentSubject = data;
        this.loadAllAssignments();
      },
      error: (err) => console.error('Hubo un problema al obtener la materia: ', err),
    });
  }

  loadAllAssignments() {
    this.taskList$ = this.classroomService
      .obtainClassroomTasks(this.currentSubject.classroom_id!)
      .pipe(
        take(1),
        tap((assignments: Assignment[]) => {
          assignments.forEach((task) => {
            this.taskStats$ = this.assignmentService.getTaskStats(
              this.currentSubject.classroom_id!,
              task.id!,
            );
          });
        }),
      );

    this.cdr.detectChanges();
  }

  deleteTask(activityId: string) {
    const confirmar = confirm(`Estas a punto de eliminar una actividad. ¿Confirmar?`);

    if (confirmar) {
      this.assignmentService.deleteAssignment(activityId).subscribe({
        next: () => {
          alert("Actividad Eliminada Con Éxito.");
        },
        error: (err) => console.error("Hubo un problema al eliminar la actividad: ", err)
      })
    }
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

  goBack() {
    this.location.back();
  }
}
