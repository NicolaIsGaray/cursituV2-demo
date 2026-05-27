import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from '../models/subject.model';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Classroom } from '../models/classroom.model';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api}/subjects`;

  private readonly SUBJECT_KEY = 'cursitu_selected_subject';

  setItemInStorage(value: any): void {
    localStorage.setItem(this.SUBJECT_KEY, JSON.stringify(value));
  }

  getItemFromStorage<T>(): T | null {
    const item = localStorage.getItem(this.SUBJECT_KEY);
    return item ? JSON.parse(item) : null;
  }

  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.apiUrl);
  }

  getSubjectById(id: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/${id}`);
  }

  createSubject(subject: Subject): Observable<Object> {
    return this.http.post(this.apiUrl, subject);
  }

  modifySubject(id: string, subject: Subject) {
    return this.http.put(`${this.apiUrl}/${id}`, subject);
  }

  toggleSuspension(id: string, status: boolean) {
    return this.http.put(`${this.apiUrl}/suspend/${id}`, status);
  }

  deleteSubject(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getClassroomInSubject(id: string): Observable<Classroom> {
    return this.http.get<Classroom>(`${this.apiUrl}/subject/${id}/classroom`)
  }

  getStudentSubjects(id: string): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/student/${id}`);
  }

  getProfessorSubjects(id: string): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/professor/${id}`);
  }

  getProfessorsInSubjects(ids: string[]): Observable<User[]> {
    let params = new HttpParams();

    ids.forEach((id) => {
      params = params.append('ids', id);
    });

    return this.http.get<User[]>(`${this.apiUrl}/professor/in`, { params });
  }
}
