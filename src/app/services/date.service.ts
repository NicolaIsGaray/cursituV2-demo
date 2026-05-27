import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { DateEvent } from '../models/date-event.model';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api}/dates`

  getAllDateEvents(): Observable<DateEvent[]> {
    return this.http.get<DateEvent[]>(this.apiUrl);
  }

  getDateEventById(id: string): Observable<DateEvent> {
    return this.http.get<DateEvent>(`${this.apiUrl}/${id}`);
  }

  createDateEvent(event: DateEvent): Observable<Object> {
    return this.http.post(this.apiUrl, event);
  }

  modifiyDateEvent(id: string, date: DateEvent) {
    return this.http.put(`${this.apiUrl}/${id}`, date);
  }

  deleteDateEvent(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
