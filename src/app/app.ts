import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, NgZone, OnInit, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule } from '@angular/router';
import { UiService } from './services/ui.service';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';
import { Role } from './models/roles';
import { SpinnerService } from './services/spinner.service';
import { Spinner } from './components/spinner/spinner';

@Component({
  selector: 'app-root',
  imports: [RouterModule, CommonModule, Spinner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('cursitu');

  private spinnerService = inject(SpinnerService);
  private ngZone = inject(NgZone);

  isSidebarOpen = false;
  currentUser: User | null = null;

  constructor(
    public uiService: UiService,
    public authService: AuthService,
    private router: Router,
  ) {}

  menuItems: any[] = [];

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Ejecutamos dentro de la zona de Angular para asegurar reactividad inmediata
        this.ngZone.run(() => {
          this.spinnerService.show();
        });
      } else if (
        event instanceof NavigationEnd || 
        event instanceof NavigationCancel || 
        event instanceof NavigationError
      ) {
        this.ngZone.run(() => {
          this.spinnerService.hide();
        });
      }
    });
    
    if (this.router.url.includes('/register-professor')) {
      return;
    }
    this.authService.userRole$.subscribe((rol) => {
      this.buildMenu(rol);
    });
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.currentUser = this.authService.currentUserValue;
  }

  buildMenu(rol: Role) {
    const baseMenu = [
      { path: '/home', icon: 'home', label: 'Inicio' },
      { path: '/subjects', icon: 'widgets', label: 'Materias' },
    ];

    if (rol === 'DOCENTE') {
      this.menuItems = [
        ...baseMenu,
        { path: '/my-classes', icon: 'class', label: 'Gestión de Clases' },
        { path: '/reports', icon: 'analytics', label: 'Reportes' },
      ];
    } else {
      this.menuItems = [
        ...baseMenu,
        { path: '/groups', icon: 'group', label: 'Mis Grupos' },
        { path: '/pending-tasks', icon: 'grid_view', label: 'Tareas' },
      ];
    }
  }

  // En el .ts correspondiente
  cambiarRol(event: any) {
    this.authService.setSimulatedRole(event.target.value);
  }

  // Retorna true si la ruta actual es /login
  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isRegisterTeacherPage(): boolean {
    return this.router.url === '/register-professor';
  }

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Cierra el dropdown si el usuario hace clic fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.isDropdownOpen = false;
    }
  }

  logout() {
    this.isDropdownOpen = false;
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
