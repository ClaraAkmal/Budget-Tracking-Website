import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  standalone: false,
  styleUrl: './auth.css'
})
export class AuthComponent implements OnInit {
  authForm!: FormGroup;
  //declare variables 
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  showPassword = false;



  //dependency injection --> initialize el services that we will use
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authForm = this.fb.group({
      displayName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  switchMode(isLogin: boolean): void {
    this.isLoginMode = isLogin;
    this.authForm.reset();
    this.errorMessage = '';
    this.isLoading = false;
  }

  //switch between register and login mode
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.authForm.reset();
  }

  onSubmit(): void {
    if (this.authForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    //put values from user's input in form in variables
    const { email, password, displayName } = this.authForm.value;
    const action$ = this.isLoginMode
      ? this.auth.login(email, password)
      : this.auth.register(email, password, displayName);

    action$.subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      }
    });
  }
}