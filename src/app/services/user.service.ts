import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api}/users`;

  allUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  searchUserByDni(dni: String): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/dni/${dni}`);
  }

  createUser(user: User): Observable<Object> {
    return this.http.post(this.apiUrl, user);
  }

  modifyUser(id: string, user: User) {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getOnlyStudents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/students`);
  }

  getOnlyProfessors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/professors`);
  }
}
