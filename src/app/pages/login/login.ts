import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpClientModule } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  error: string | null = null;

  activeTab: 'login' | 'register' = 'login'; // por defecto

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      pp: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.auth.login(email, password).subscribe({
        next: (res) => {
          this.auth.storeToken(res.token);
          const token = localStorage.getItem('auth_token');
          if (token) {
            const user: any = jwtDecode(token);
            sessionStorage.setItem('cl', JSON.stringify(user));
          } else {
            this.error = 'No auth token found after login.';
            return;
          }
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = err.error.messages.error;
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;

      this.auth.register(name, email, password).subscribe({
        next: (res) => {
          //this.auth.storeToken(res.token);
          this.router.navigate(['login']);
        },
        error: (err) => {
          this.error = err.error.messages.error;
        }
      });

    } else {
      this.error = 'Formulario de registro inválido';
    }
  }
}
