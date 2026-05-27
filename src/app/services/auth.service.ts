import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { Role } from '../models/roles';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginData {
  dni: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private route = inject(Router);
  private apiUrl = `${environment.api}/auth`

  private readonly ROL_KEY = 'cursitu_mock_role';
  private readonly USER_KEY = 'cursitu_mock_user';

  private userSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
  
  currentUser$ = this.userSubject.asObservable();

  private roleSubject = new BehaviorSubject<Role>(
    (localStorage.getItem(this.ROL_KEY) as Role) || 'ALUMNO'
  );
  userRole$ = this.roleSubject.asObservable();

  constructor(private activeRoute: Router) {}

  login(user: LoginData): Observable<User> {
  return this.http.post<User>(`${this.apiUrl}/login`, user).pipe(
    tap((loggedUser) => {
      if (loggedUser && loggedUser.role) {
        this.setSimulatedRole(loggedUser.role as Role);
        localStorage.setItem(this.USER_KEY, JSON.stringify(loggedUser));
        this.userSubject.next(loggedUser);
      }
    })
  );
}

  setSimulatedRole(nuevoRol: Role) {
    localStorage.setItem(this.ROL_KEY, nuevoRol);
    this.roleSubject.next(nuevoRol);
  }

  get currentRole(): Role {
    return this.roleSubject.value;
  }

  get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  logout() {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROL_KEY);

    this.userSubject.next(null);
    this.roleSubject.next('ALUMNO' as Role); 

    this.getAuthStatus();
  }

  getAuthStatus() {
    if (!this.currentUserValue) {
      if (this.activeRoute.url === '/register-professor') return;
      this.route.navigate(['/login']);
      return;
    }

    if (this.currentRole === 'ADMIN') {
      this.route.navigate(['/user-management']);
    }
  }

  // Método auxiliar privado para el constructor del Subject
  private getUserFromLocalStorage(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Error al parsear el usuario del localStorage', error);
      return null;
    }
  }
}