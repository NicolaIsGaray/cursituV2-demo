import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SubjectService } from '../../../services/subject.service';
import { Observable, take, tap } from 'rxjs';
import { Subject } from '../../../models/subject.model';
import { DateService } from '../../../services/date.service';
import { DateEvent } from '../../../models/date-event.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-dates',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './manage-dates.html',
  styleUrl: './manage-dates.css',
})
export class ManageDates implements OnInit {
  subjectId: string | null = null;

  currentSubject$!: Observable<Subject>;

  dateList$!: Observable<DateEvent[]>;

  isCreating: boolean = false;
  newDateEvent!: DateEvent;

  constructor(
    public authService: AuthService,
    private location: Location,
    private subjectService: SubjectService,
    private dateService: DateService
  ) {}

  ngOnInit(): void {
    this.getCurrentSubject();
    this.loadAllDates();
  }

  getCurrentSubject() {
    this.subjectId = this.subjectService.getItemFromStorage();

    this.currentSubject$ = this.subjectService.getSubjectById(this.subjectId!).pipe(
      take(1),
      tap((subject: Subject) => {
        document.documentElement.style.setProperty('--subject-color', subject.color);
      }),
    );
  }

  loadAllDates() {
    this.dateList$ = this.dateService.getAllDateEvents();
  }

  activateScheduleProgram(): void {
    this.newDateEvent = {
      title: '',
      event: 'EXAMEN',
      important: false,
      date: null!,
      subjectId: this.subjectId!,
    };
    this.isCreating = true;
  }

  cancelCreation(): void {
    this.isCreating = false;
  }

  saveNewDateEvent(): void {
    if (!this.newDateEvent.title.trim()) {
      alert('Por favor, ingresá un nombre para el evento.');
      return;
    }
    if (!this.newDateEvent.date) {
      alert('Por favor, seleccioná una fecha y hora válida.');
      return;
    }

    this.dateService.createDateEvent(this.newDateEvent).subscribe({
      next: () => {
        alert('Fecha Creada Exitosamente.');
        window.location.reload();
      },
      error: (err) => console.error('Hubo un problema al intentar crear la fecha: ', err),
    });

    this.isCreating = false;
  }

  deleteDateEvent(dateId: string) {
    const confirmation = confirm('Estas por eliminar este evento registrado ¿Proceder?');

    if (confirmation) {
      this.dateService.deleteDateEvent(dateId).subscribe({
        next: () => {
          alert('Fecha eliminada con éxito.');
          window.location.reload();
        },
        error: (err) => console.error('Hubo un problema al intentar eliminar la fecha: ', err),
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
