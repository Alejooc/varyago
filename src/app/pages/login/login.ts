import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  error: string | null = null;

  activeTab: 'login' | 'register' = 'login'; // por defecto

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.auth.login(email, password).subscribe({
        next: (res) => {
          this.auth.storeToken(res.token);
          console.log('✅ Login correcto');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.warn('❌ Login inválido', err);
          console.log(err);
          
          this.error = err.error.messages.error;
        }
      });
    }
  }

  onRegister(): void {
    console.log('Registro enviado');
  }
}
