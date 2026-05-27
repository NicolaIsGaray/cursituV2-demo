import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { SubjectService } from '../../../services/subject.service';
import { switchMap, take } from 'rxjs';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-teacher-register',
  imports: [ReactiveFormsModule],
  templateUrl: './teacher-register.html',
  styleUrl: './teacher-register.css',
})
export class TeacherRegister implements OnInit {
  registerForm!: FormGroup;
  currentStep: number = 1;

  daysOfWeekList = [
    { label: 'Lunes', value: 'MONDAY' },
    { label: 'Martes', value: 'TUESDAY' },
    { label: 'Miércoles', value: 'WEDNESDAY' },
    { label: 'Jueves', value: 'THURSDAY' },
    { label: 'Viernes', value: 'FRIDAY' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      // Paso 1: Cuenta (Se añade email por compatibilidad estructural con el validador del backend si fuese requerido, o vacío si no se solicita en el form)
      account: this.fb.group({
        name: ['', Validators.required],
        dni: ['', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      }),
      // Paso 2: Materia
      subject: this.fb.group({
        name: ['', Validators.required],
        color: ['#3f3689', Validators.required],
        year: ['', Validators.required],
        period: ['', Validators.required],
      }),
      // Paso 3: Horarios
      schedules: this.fb.array([]),
    });

    // Añadir un renglón de horario por defecto
    this.addScheduleSlot();
  }

  get schedulesFormArray() {
    return this.registerForm.get('schedules') as FormArray;
  }

  addScheduleSlot(): void {
    const slotGroup = this.fb.group({
      day: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
    this.schedulesFormArray.push(slotGroup);
  }

  removeScheduleSlot(index: number): void {
    if (this.schedulesFormArray.length > 1) {
      this.schedulesFormArray.removeAt(index);
    }
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      const accountGroup = this.registerForm.get('account');
      accountGroup?.markAllAsTouched();
      if (accountGroup?.valid) this.currentStep = 2;
    } else if (this.currentStep === 2) {
      const subjectGroup = this.registerForm.get('subject');
      subjectGroup?.markAllAsTouched();
      if (subjectGroup?.valid) this.currentStep = 3;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    this.schedulesFormArray.markAllAsTouched();
    
    if (this.registerForm.invalid || this.schedulesFormArray.length === 0) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const rawValue = this.registerForm.value;

    // 1. Mapeo del Payload del Usuario (Estructura de UserManagement)
    const userPayload: User = {
      name: rawValue.account.name.trim(),
      email: `${rawValue.account.dni}@cursitu.edu.ar`, // Email autogenerado fallback para no romper restricciones de base de datos
      dni: rawValue.account.dni,
      password: '',
      role: 'DOCENTE',
      classroom_number: 0,
      comission: ['A', 'B'], // Comisiones asignadas por defecto para la demo
      subjects_id: [],
      hasGroup: false
    };

    // 2. Ejecución secuencial reactiva (Crear Usuario -> Con el ID resultante -> Crear Materia)
    this.userService.createUser(userPayload)
      .pipe(
        take(1),
        switchMap((createdUser: any) => {
          // Extraemos el ID del docente persistido (se asume que llega en createdUser.id o createdUser._id)
          const professorId = createdUser.id || createdUser._id;

          // Mapeo estructurado de horarios nativos HH:mm sin desfasajes de zona horaria
          const formattedSchedules = rawValue.schedules.map((slot: any) => ({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }));

          // 3. Mapeo del Payload de la Materia (Estructura de SubjectManagement)
          const subjectPayload = {
            subject_name: rawValue.subject.name.trim(),
            color: rawValue.subject.color,
            professor_id: professorId,
            year_level: parseInt(rawValue.subject.year, 10),
            academic_period: [parseInt(rawValue.subject.period, 10)],
            schedule: formattedSchedules,
          };

          return this.subjectService.createSubject(subjectPayload);
        })
      )
      .subscribe({
        next: () => {
          alert('Registro completado con éxito. Tu cuenta docente y tu materia han sido configuradas.');
          this.registerForm.reset();
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Error durante el flujo de alta de la demo:', err);
          alert(err.error?.message || 'Hubo un error en el procesamiento de los datos. Verifique la consola.');
        }
      });
  }
}
