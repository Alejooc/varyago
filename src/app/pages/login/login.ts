import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


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
    constructor(private fb: FormBuilder) {
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
        console.log('Login:', email, password);
      }else{
        console.log('Formulario inválido');
      }
    }
    onRegister(): void {
      console.log('Registro enviado');
    }
}
