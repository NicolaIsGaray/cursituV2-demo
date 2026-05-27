import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
  ) {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      dni: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value as any;

      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          alert('Credenciales inválidas. Intenta de nuevo.');
          console.error(err);
        },
      });
    }
  }
}
