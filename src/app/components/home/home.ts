import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { catchError, combineLatest, filter, Observable, of, take } from 'rxjs';
import { AssignmentService } from '../../services/assignment.service';
import { SubjectService } from '../../services/subject.service';
import { UserService } from '../../services/user.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { AssignmentDTO } from '../../models/dto/assignmentDTO';
import { Subject } from '../../models/subject.model';
import { Topic } from '../../models/topic.model';
import { TopicService } from '../../services/topic.service';
import { ClassroomService } from '../../services/classroom.service';
import { Assignment } from '../../models/assignment.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  pendingAssignments$!: Observable<any[]>;
  studentList$!: Observable<User[]>;

  professorSubjects$!: Observable<Subject[]>;
  selectedSubjectId: string = '';

  lastActivity$!: Observable<Topic>;
  lastActivityVisited!: Topic & { classroomId: string };
  lastActivitySubject$!: Observable<Subject>;
  lastActivityAssignment$!: Observable<Assignment>;
  activityTime!: any;

  currentUser$!: Observable<User>;

  private readonly SUBJECT_KEY = 'cursitu_selected_subject';

  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private assignmentService: AssignmentService,
    private subjectService: SubjectService,
    private topicService: TopicService,
    private classroomService: ClassroomService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue!;
    this.currentUser$ = this.userService.getUserById(user.id!);

    this.activityTime = this.topicService.getTopicTimeFromStorage();

    this.loadLastActivityVisited();
    this.loadAssignmentsWithSubjectNames();
    if (user.role === 'DOCENTE') {
      this.loadProfessorSubjects();
    }
  }

  loadLastActivityVisited() {
    const topicId = this.topicService.getTopicFromStorage();

    if (topicId == null) return;

    this.lastActivity$ = this.topicService.getTopicById(topicId!);

    this.lastActivity$.subscribe({
      next: (topic) => {
        this.lastActivityVisited = {
          ...topic,
          classroomId: topic.classroom_id!,
        };

        this.loadLastActivityAssignment(topic.assignmentId!);

        this.classroomService.getClassroomById(topic.classroom_id).subscribe({
          next: (classroom) => {
            this.loadActivitySubject(classroom.subject_id!);
            this.cdr.detectChanges();
          },
          error: (err) =>
            console.error(
              'Hubo un problema al buscar el curso relativo a la ultima actividad: ',
              err,
            ),
        });
      },
    });
  }

  loadActivitySubject(id: string) {
    this.lastActivitySubject$ = this.subjectService.getSubjectById(id).pipe(
      tap((subject: Subject) => {
        document.documentElement.style.setProperty('--subject-color', subject.color);
      }),
    );
  }

  loadLastActivityAssignment(id: string) {
    this.lastActivityAssignment$ = this.assignmentService.getAssignmentById(id);
  }

  loadProfessorSubjects() {
    this.currentUser$.subscribe({
      next: (user) => {
        this.professorSubjects$ = this.subjectService.getProfessorSubjects(user.id!);
        this.initSubjectAutoSelection();
      },
    });
  }

  initSubjectAutoSelection(): void {
    this.professorSubjects$
      .pipe(
        filter((subjects) => subjects && subjects.length > 0),
        take(1),
      )
      .subscribe((subjects) => {
        const firstSubjectId = subjects[0].id;
        this.selectedSubjectId = firstSubjectId!;

        this.cdr.detectChanges();

        this.loadStudentsBySubject(firstSubjectId!);
      });
  }

  onSubjectChange(event: Event): void {
    const element = event.target as HTMLSelectElement;
    this.selectedSubjectId = element.value;
    this.loadStudentsBySubject(this.selectedSubjectId);
  }

  loadStudentsBySubject(subjectId: string) {
    this.subjectService.getSubjectById(subjectId).subscribe({
      next: (subject) => {
        this.studentList$ = this.classroomService.getStudentsInClassroom(subject.classroom_id!);
        this.cdr.detectChanges();
      },
      error: (err) =>
        console.error('Hubo un problema al obtener la materia para la lista de alumnos: ', err),
    });
  }

  loadAssignmentsWithSubjectNames() {
    this.pendingAssignments$ = this.authService.currentUser$.pipe(
      filter((user) => !!user),
      take(1),
      switchMap((user) => {
        return combineLatest([
          this.assignmentService.getPendingAssignments(user.id!),
          this.subjectService.getAllSubjects(),
        ]).pipe(
          map(([assignments, subjects]: [AssignmentDTO[], Subject[]]) => {
            const subjectMap = new Map<string, string>(
              subjects.map((s: any) => [s.id, s.subject_name]),
            );

            return assignments.map((activity: any) => ({
              ...activity,
              subjectNameResolved: subjectMap.get(activity.subject_id) || 'Materia No Asignada',
            }));
          }),
        );
      }),
      catchError((err) => {
        console.error('Error al cruzar actividades con materias en el front:', err);
        return of([]);
      }),
    );
  }

  translateDayToSpanish(day: string): string {
    const translations: { [key: string]: string } = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };
    return translations[day.toUpperCase()] || day;
  }

  goToActivity(path: string, subjectId: string): void {
    localStorage.setItem(this.SUBJECT_KEY, subjectId);
    this.router.navigate([path]);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
