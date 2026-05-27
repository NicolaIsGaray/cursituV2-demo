import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject } from '../../models/subject.model';
import { SubjectService } from '../../services/subject.service';
import { combineLatest, Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-subjects',
  imports: [CommonModule, RouterModule],
  templateUrl: './subjects-list.html',
  styleUrls: ['./subjects-list.css'],
})
export class SubjectsList implements OnInit {
  professorSubjects$?: Observable<Subject[]>;
  studentSubjectList$?: Observable<Subject[]>;

  userData!: User;

  professorList$!: Observable<User[]>;

  subjectsWithProfessors$!: Observable<any[]>;

  expandedSubjectId: string | null = null;

  constructor(
    private router: Router,
    public authService: AuthService,
    private subjectService: SubjectService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.subjectService.setItemInStorage(null);

    this.userData = this.authService.currentUserValue!;

    if (this.userData === null) {
      console.error('Usuario no encontrado.');
    }

    if (this.userData.role === 'ALUMNO') {
      this.studentSubjectList$ = this.subjectService.getStudentSubjects(this.userData.id!);
      this.professorList$ = this.subjectService.getProfessorsInSubjects(this.userData.subjects_id!);

      this.combineSubjectsWithProfessors();
    } else if (this.userData.role === 'DOCENTE') {
      this.professorSubjects$ = this.subjectService.getProfessorSubjects(this.userData.id!);
    }
  }

  combineSubjectsWithProfessors() {
    if (!this.studentSubjectList$ || !this.professorList$) {
      console.warn('Los flujos de datos aún no se han inicializado.');
      return;
    }

    this.subjectsWithProfessors$ = combineLatest({
      subjects: this.studentSubjectList$,
      professors: this.professorList$,
    }).pipe(
      map(({ subjects, professors }: { subjects: any[]; professors: any[] }) => {
        if (!subjects || !professors) return [];

        return subjects.map((subject: any) => {
          const matchingProfessor = professors.find((p: any) => p.id === subject.professor_id);

          return {
            ...subject,
            professor_name: matchingProfessor ? `${matchingProfessor.name}` : 'Sin asignar',
          };
        });
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

  toggleSchedule(subjectId: string, event: Event): void {
    event.stopPropagation();
    this.expandedSubjectId = this.expandedSubjectId === subjectId ? null : subjectId;
  }

  navigateToClassroom(path: string, classroomId: string) {
    this.router.navigate([path, classroomId]);
  }

  navigateToPanel(path: string, subjectId: string) {
    this.subjectService.setItemInStorage(subjectId);

    this.router.navigate([path]);
  }

  goBack() {
    this.location.back();
  }
}
