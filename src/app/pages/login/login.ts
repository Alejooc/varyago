import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']  // ✅ PLURAL
})
export class Login{

  loginForm!: FormGroup;

  activeTab: 'login' | 'register' = 'login'; // por defecto
    constructor(private fb: FormBuilder, private auth: AuthService,private router: Router) {
      this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    }
    ngOnInit(): void {
      
    }
    onSubmit(): void {
      if (this.loginForm.valid) {
        const { email, password } = this.loginForm.value;

        const success = this.auth.login(email, password);
        if (success) {
          console.log('✅ Login correcto');
          this.router.navigate(['/']); // redirigir al home
        } else {
          console.warn('❌ Login inválido');
        }
      }
    }
    onRegister(): void {
      console.log('Registro enviado');
    }
}
