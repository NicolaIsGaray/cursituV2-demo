import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { SubjectService } from '../../../services/subject.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  merge,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';

import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  mode: 'crear' | 'editar' | 'eliminar' | null = null;
  userForm!: FormGroup;
  userToUpdateId: string | null = null;
  userToDeleteSel: any = null;

  comissionList = ['A', 'B'];
  roleList = [{ name: 'ALUMNO' }, { name: 'DOCENTE' }, { name: 'ADMIN' }];
  subjectList: any[] = [];

  dniEditControl = new FormControl('');
  dniDeleteControl = new FormControl('');
  usersFound$!: Observable<any[]>;

  private refreshSearch$ = new BehaviorSubject<void>(undefined);

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private userService: UserService,
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupDniSearchPipeline();
    this.loadSubjects();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      fullname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      dni: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^\d+$/)]],
      role: ['', Validators.required],
      classroom_number: [''],
      comissions: this.fb.array([]),
      assigned_subjects: this.fb.array([]),
    });

    this.buildComissionCheckboxes();
  }

  get comissionFromArray(): FormArray {
    return this.userForm.get('comissions') as FormArray;
  }

  get subjectFormArray(): FormArray {
    return this.userForm.get('assigned_subjects') as FormArray;
  }

  private buildComissionCheckboxes(userCommissions: string[] = []): void {
    this.comissionFromArray.clear();
    this.comissionList.forEach((com) => {
      const isMarked = userCommissions.includes(com);
      this.comissionFromArray.push(new FormControl(isMarked));
    });
  }

  private buildSubjectCheckboxes(userSubjectIds: string[] = []): void {
    this.subjectFormArray.clear();
    const checkedSet = new Set(userSubjectIds.map((id) => String(id)));
    this.subjectList.forEach((subject) => {
      this.subjectFormArray.push(new FormControl(checkedSet.has(String(subject.id))));
    });
  }

  private loadSubjects(): void {
    this.subjectService
      .getAllSubjects()
      .pipe(take(1))
      .subscribe({
        next: (subjects: any) => {
          this.subjectList = subjects;
          this.buildSubjectCheckboxes();
        },
        error: (err) => console.error('Error al cargar materias:', err),
      });
  }

  private setupDniSearchPipeline(): void {
    const dniSource$ = merge(
      this.dniEditControl.valueChanges.pipe(startWith(this.dniEditControl.value || '')),
      this.dniDeleteControl.valueChanges.pipe(startWith(this.dniDeleteControl.value || '')),
    ).pipe(map((dni) => (dni ? dni.trim() : '')));

    this.usersFound$ = this.refreshSearch$.pipe(
      switchMap(() => dniSource$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((dni) => {
        if (!dni || dni.length < 1) {
          return of([]);
        }
        return this.userService.searchUserByDni(dni);
      }),
    );
  }

  private mapFormToModel(): any {
    const { fullname, dni, email, role, classroom_number } = this.userForm.value;

    const selectedComissions = (this.comissionFromArray.value as boolean[])
      .map((checked: boolean, i: number) => (checked ? this.comissionList[i] : null))
      .filter((v: string | null): v is string => v !== null);

    const selectedSubjects = (this.subjectFormArray.value as boolean[])
      .map((checked: boolean, i: number) => (checked ? this.subjectList[i].id : null))
      .filter((v: string | null): v is string => v !== null);

    return {
      name: fullname ? fullname.trim() : '',
      email: email ? email.trim() : '',
      dni: dni || '',
      role: role || '',
      classroom_number: classroom_number || '',
      comission: selectedComissions,
      subjects_id: selectedSubjects,
    };
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = this.mapFormToModel();

    if (this.mode === 'crear') {
      this.userService
        .createUser(payload)
        .pipe(take(1))
        .subscribe({
          next: () => {
            alert('Usuario Registrado Exitosamente.');
            this.resetManagementState();
          },
          error: (err) => alert(err.error?.message || 'Error al crear'),
        });
    } else if (this.mode === 'editar' && this.userToUpdateId) {
      this.userService
        .modifyUser(this.userToUpdateId, payload)
        .pipe(take(1))
        .subscribe({
          next: () => {
            alert('Usuario Modificado Exitosamente.');
            this.resetManagementState();
          },
          error: (err) => alert(err.error?.message || 'Error al modificar'),
        });
    }
  }

  deleteUser(): void {
    if (!this.userToDeleteSel) return;

    if (confirm(`¿Estás seguro de eliminar a ${this.userToDeleteSel.name}?`)) {
      this.userService
        .deleteUser(this.userToDeleteSel.id)
        .pipe(take(1))
        .subscribe({
          next: () => {
            alert('Usuario eliminado con éxito.');
            this.resetManagementState();
          },
          error: (err) => alert(err.error?.message || 'Error al eliminar'),
        });
    }
  }

  userToEdit(user: any): void {
    this.mode = 'editar';
    this.userToUpdateId = user.id;

    this.userForm.patchValue({
      fullname: user.name,
      email: user.email,
      dni: user.dni,
      role: user.role,
      classroom_number: user.classroom_number,
    });

    this.buildComissionCheckboxes(user.comission || []);
    this.buildSubjectCheckboxes(user.subjects_id || []);
    this.cdr.detectChanges();
  }

  resetManagementState(): void {
    this.userForm.reset();
    this.dniEditControl.setValue('', { emitEvent: true });
    this.dniDeleteControl.setValue('', { emitEvent: true });

    this.userToUpdateId = null;
    this.userToDeleteSel = null;

    this.buildComissionCheckboxes();
    this.buildSubjectCheckboxes();

    this.refreshSearch$.next();
    this.cdr.detectChanges();

    this.mode = null;
    this.cdr.detectChanges();
  }

  changeMode(newMode: 'crear' | 'editar' | 'eliminar'): void {
    this.mode = newMode;
    // Si entramos a crear, nos aseguramos de que los arrays limpien cualquier rastro de ediciones previas
    if (newMode === 'crear') {
      this.userForm.reset();
      this.buildComissionCheckboxes();
      this.buildSubjectCheckboxes();
    }
  }

  selectUserToDelete(user: any): void {
    this.userToDeleteSel = user;
  }
}
