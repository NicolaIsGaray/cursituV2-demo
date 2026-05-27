import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { SubjectService } from '../../services/subject.service';
import { catchError, Observable, of, take } from 'rxjs';
import { Subject } from '../../models/subject.model';
import { User } from '../../models/user.model';
import { ClassroomService } from '../../services/classroom.service';
import { Group } from '../../models/group.model';
import { GroupService } from '../../services/group.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-students-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './students-list.html',
  styleUrl: './students-list.css',
})
export class StudentsList implements OnInit {
  professorSubjects$!: Observable<Subject[]>;
  selectedSubject!: Subject;

  userData!: User;

  students$!: Observable<User[]>;
  studentList!: (User & { groupNumber: number | null; hasGroupInSubject: boolean })[];

  groupList$!: Observable<Group[]>;

  classroomId!: string;

  constructor(
    public authService: AuthService,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private subjectService: SubjectService,
    private classroomService: ClassroomService,
    private groupService: GroupService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.userData = this.authService.currentUserValue!;

    this.getProfessorSubjects();
  }

  getProfessorSubjects() {
    this.professorSubjects$ = this.subjectService.getProfessorSubjects(this.userData.id!);
  }

  getSelectedSubject(id: string) {
    this.subjectService.getSubjectById(id).subscribe({
      next: (subject) => {
        this.selectedSubject = subject;

        this.classroomId = subject.classroom_id!;

        document.documentElement.style.setProperty('--subject-color', subject.color);

        this.loadGroupStatus(subject.id!);

        this.obtainStudentsInClassroom(this.classroomId);
      },
      error: (err) => console.error('Hubo un problema al intentar obtener la materia: ', err),
    });
  }

  obtainStudentsInClassroom(classroomId: string) {
    this.students$ = this.classroomService.getStudentsInClassroom(classroomId);

    this.groupList$.pipe(take(1)).subscribe({
      next: (currentGroups: Group[]) => {
        const studentGroupMap = new Map<string, number>();

        currentGroups.forEach((group) => {
          if (group.members_id) {
            group.members_id.forEach((studentId) => {
              studentGroupMap.set(String(studentId), group.number);
            });
          }
        });

        this.students$.subscribe({
          next: (students: User[]) => {
            this.studentList = students.map((student) => {
              const assignedGroupNumber = studentGroupMap.get(String(student.id));

              return {
                ...student,
                groupNumber: assignedGroupNumber || null,
                hasGroupInSubject: assignedGroupNumber !== undefined,
              };
            });

            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error al recuperar alumnos del aula:', err),
        });
      },
      error: (err) => console.error('Error al recuperar los grupos para el filtro:', err),
    });
  }

  loadGroupStatus(id: string) {
    this.groupList$ = this.groupService.getGroupsInSubject(id).pipe(
      catchError((err) => {
        console.warn('No se encontraron grupos o la materia está vacía:', err);
        return of([]);
      }),
    );
  }

  downloadStudentList(subjectName: string) {
    this.dataService.downloadStudentList(this.classroomId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `alumnos-${subjectName.replace(/ /g, "-")}.xlsx`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error("Hubo un problema al intentar exportar la lista de alumnos: ", err)
    })
  }

  goBack() {
    this.location.back();
  }
}
