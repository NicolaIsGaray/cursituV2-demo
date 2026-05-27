import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject } from '../../../models/subject.model';
import { BehaviorSubject, map, Observable, of, switchMap, take } from 'rxjs';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { SubjectService } from '../../../services/subject.service';
import { UserService } from '../../../services/user.service';
import { SubjectSchedule } from '../../../models/subject-schedule.model';

@Component({
  selector: 'app-subject-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subject-management.html',
  styleUrl: './subject-management.css',
})
export class SubjectManagement implements OnInit {
  mode: 'crear' | 'editar' | 'suspender' | null = null;
  subjectForm!: FormGroup;
  subjectToUpdateId: string | null = null;
  subjectToSuspendSel: Subject | null = null;

  subjectList$!: Observable<Subject[]>;
  suspendedSubjectList$!: Observable<Subject[]>;
  professorList$!: Observable<User[]>;

  periodList = [1, 2];
  yearList = [1, 2, 3];

  // Listado en español para el Dropdown estructurado para Java
  daysOfWeekList = [
    { label: 'Lunes', value: 'MONDAY' },
    { label: 'Martes', value: 'TUESDAY' },
    { label: 'Miércoles', value: 'WEDNESDAY' },
    { label: 'Jueves', value: 'THURSDAY' },
    { label: 'Viernes', value: 'FRIDAY' },
    { label: 'Sábado', value: 'SATURDAY' },
    { label: 'Domingo', value: 'SUNDAY' },
  ];

  private refreshSubjects$ = new BehaviorSubject<void>(undefined);

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProfessors();
    this.setupSubjectsPipeline();
  }

  private initForm(): void {
    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      color: ['', Validators.required],
      professor: ['', Validators.required],
      year: ['', Validators.required],
      periods: this.fb.array([]),
      schedules: this.fb.array([], Validators.required),
    });
    this.addPeriodCheckboxes();
  }

  get periodFromArray() {
    return this.subjectForm.get('periods') as FormArray;
  }

  get schedulesFormArray() {
    return this.subjectForm.get('schedules') as FormArray;
  }

  private addPeriodCheckboxes(selectedPeriods: number[] = []): void {
    this.periodFromArray.clear();
    this.periodList.forEach((period) => {
      this.periodFromArray.push(new FormControl(selectedPeriods.includes(period)));
    });
  }

  addScheduleSlot(): void {
    const slotGroup = this.fb.group({
      day: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
    this.schedulesFormArray.push(slotGroup);
    this.schedulesFormArray.markAsTouched();
  }

  removeScheduleSlot(index: number): void {
    this.schedulesFormArray.removeAt(index);
  }

  private setupSubjectsPipeline(): void {
    const fetchSubjects$ = this.refreshSubjects$.pipe(
      switchMap(() => this.subjectService.getAllSubjects()),
    );

    this.subjectList$ = fetchSubjects$.pipe(
      map((list: Subject[]) => list.filter((s) => !s.isSuspended)),
    );
    this.suspendedSubjectList$ = fetchSubjects$.pipe(
      map((list: Subject[]) => list.filter((s) => s.isSuspended)),
    );
  }

  private loadProfessors(): void {
    this.professorList$ = this.userService.getOnlyProfessors();
  }

  onSubmit(): void {
    this.schedulesFormArray.markAllAsTouched();

    if (this.subjectForm.invalid || this.schedulesFormArray.length === 0) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const { name, color, professor, year, schedules } = this.subjectForm.value;

    const periods = this.periodFromArray.value
      .map((checked: boolean, i: number) => (checked ? this.periodList[i] : null))
      .filter((v: any): v is number => v !== null);

    // Mapeo directo de inputs limpios sin riesgos de TimeZones ni desfases
    const formattedSchedules: SubjectSchedule[] = schedules.map((slot: any) => {
      return {
        day: slot.day,
        startTime: slot.startTime, // Formato nativo "HH:mm"
        endTime: slot.endTime, // Formato nativo "HH:mm"
      };
    });

    const payload: Subject = {
      subject_name: name.trim(),
      color,
      professor_id: professor.trim(),
      year_level: year,
      academic_period: periods,
      schedule: formattedSchedules,
    };

    if (this.mode === 'crear') {
      this.subjectService
        .createSubject(payload)
        .pipe(take(1))
        .subscribe({
          next: () => this.completeOperation('Materia creada con éxito y Curso asignado.'),
          error: (err: any) => console.error(err),
        });
    } else if (this.mode === 'editar' && this.subjectToUpdateId) {
      this.subjectService
        .modifySubject(this.subjectToUpdateId, payload)
        .pipe(take(1))
        .subscribe({
          next: () => this.completeOperation('Materia modificada con éxito.'),
          error: (err: any) => console.error(err),
        });
    }
  }

  selectSubjectToEdit(subject: Subject): void {
    this.subjectToUpdateId = subject.id || null;

    this.subjectForm.patchValue({
      name: subject.subject_name,
      color: subject.color,
      professor: subject.professor_id,
      year: subject.year_level,
    });

    this.addPeriodCheckboxes(subject.academic_period);

    this.schedulesFormArray.clear();
    if (subject.schedule && subject.schedule.length > 0) {
      subject.schedule.forEach((slot) => {
        this.schedulesFormArray.push(
          this.fb.group({
            day: [slot.day, Validators.required],
            startTime: [slot.startTime, Validators.required],
            endTime: [slot.endTime, Validators.required],
          }),
        );
      });
    }
  }

  selectSubjectToSuspend(e: Event) {
    const element = e.target as HTMLSelectElement;
    const subjectId = element.value;

    this.subjectService.getSubjectById(subjectId).subscribe({
      next: (data: Subject) => {
        this.subjectToSuspendSel = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Hubo un error al obtener la materia a suspender: ', err),
    });
  }

  suspendSubject(): void {
    if (!this.subjectToSuspendSel) return;
    if (!confirm(`¿Deseas suspender la materia ${this.subjectToSuspendSel.subject_name}?`)) return;

    this.subjectService
      .toggleSuspension(this.subjectToSuspendSel.id!, true)
      .pipe(take(1))
      .subscribe({
        next: () => this.completeOperation('Materia Suspendida Correctamente.'),
      });
  }

  reactivateSubject(subject: Subject) {
    if (!subject) return;
    if (!confirm(`¿Deseas rehabilitar la materia ${subject.subject_name}?`)) return;

    this.subjectService
      .toggleSuspension(subject.id!, false)
      .pipe(take(1))
      .subscribe({
        next: () => this.completeOperation('Materia Activada Correctamente.'),
      });
  }

  deleteSubject(subject: Subject): void {
    if (
      !confirm(
        `¿Estás seguro de eliminar permanentemente la materia ${subject.subject_name} y todas sus dependencias en cascada?`,
      )
    )
      return;

    this.subjectService
      .deleteSubject(subject.id!)
      .pipe(take(1))
      .subscribe({
        next: () =>
          this.completeOperation('Materia y dependencias eliminadas con éxito en el servidor.'),
      });
  }

  private completeOperation(message: string): void {
    alert(message);
    this.subjectForm.reset();
    this.schedulesFormArray.clear();
    this.addPeriodCheckboxes();
    this.mode = null;
    this.subjectToUpdateId = null;
    this.subjectToSuspendSel = null;
    this.refreshSubjects$.next();
  }

  changeMode(newMode: 'crear' | 'editar' | 'suspender') {
    if (this.mode === newMode) return;

    this.mode = newMode;
    this.subjectForm.reset();
    this.schedulesFormArray.clear();
    this.addPeriodCheckboxes();
    this.subjectToUpdateId = null;
    this.subjectToSuspendSel = null;
  }
}
