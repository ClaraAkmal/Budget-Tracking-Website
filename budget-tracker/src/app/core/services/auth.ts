import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { TransactionService } from './transaction';  
import { BudgetService } from './budget';
import { GoalService } from './goal';

interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiKey = environment.firebase.apiKey;
  private signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`;
  private signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, 
    private router: Router ,
    private transactionService: TransactionService,  
    private budgetService: BudgetService,           
    private goalService: GoalService ) {

    this.loadUserFromStorage();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  register(email: string, password: string, displayName: string): Observable<User> {
    return this.http.post<AuthResponseData>(this.signUpUrl, {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      map(res => this.buildUser(res, displayName)),
      tap(user => this.setCurrentUser(user)),
      catchError(err => this.handleError(err)) // FIX: arrow function preserves `this`
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponseData>(this.signInUrl, {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      map(res => this.buildUser(res)),
      tap(user => this.setCurrentUser(user)),
      catchError(err => this.handleError(err)) // FIX: arrow function preserves `this`
    );
  }

  logout(): void {
     this.transactionService.clear();
    this.budgetService.clear();
    this.goalService.clear();

    this.currentUserSubject.next(null);
    localStorage.removeItem('budgetUser');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const user = this.currentUserSubject.value as any;
    return user ? user['idToken'] : null;
  }

  private buildUser(res: AuthResponseData, displayName?: string): User {
    return {
      uid: res.localId,
      email: res.email,
      displayName: displayName || res.displayName || res.email.split('@')[0],
      createdAt: new Date().toISOString(),
      idToken: res.idToken,
      expiresIn: res.expiresIn
    } as any;
  }

  private setCurrentUser(user: User): void {
    

    this.currentUserSubject.next(user);
    localStorage.setItem('budgetUser', JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('budgetUser');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  private handleError(errorRes: any): Observable<never> {
    let errorMessage = 'An unknown error occurred.';
    const code: string = errorRes?.error?.error?.message || '';

    if (!code) {
      return throwError(() => new Error(errorMessage));
    }

    switch (code) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email is already registered.'; break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'No account found with this email.'; break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Incorrect password.'; break;
      case 'INVALID_LOGIN_CREDENTIALS':
        errorMessage = 'Invalid email or password.'; break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMessage = 'Too many attempts. Try again later.'; break;
      case 'USER_DISABLED':
        errorMessage = 'This account has been disabled.'; break;
      default:
        if (code.includes('WEAK_PASSWORD')) {
          errorMessage = 'Password must be at least 6 characters.';
        } else {
          errorMessage = 'Something went wrong. Please try again.';
        }
    }
    return throwError(() => new Error(errorMessage));
  }
}