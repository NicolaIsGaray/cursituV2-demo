import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api}`;

  downloadStudentList(classroomId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/excel/student-list/${classroomId}`, { responseType: 'blob' });
  }
}
