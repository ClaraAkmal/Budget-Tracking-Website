import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiKey = environment.firebase.apiKey;
  private signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`;
  private signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  register(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponseData>(this.signUpUrl, {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      map(res => this.buildUser(res)),
      tap(user => this.setCurrentUser(user)),
      catchError(this.handleError)
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
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('budgetUser');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const user = this.currentUserSubject.value as any;
    return user ? user['idToken'] : null;
  }

  private buildUser(res: AuthResponseData): User {
    return {
      uid: res.localId,
      email: res.email,
      displayName: res.email.split('@')[0],
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
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(() => new Error(errorMessage));
    }
    switch (errorRes.error.error.message) {
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
    }
    return throwError(() => new Error(errorMessage));
  }
}