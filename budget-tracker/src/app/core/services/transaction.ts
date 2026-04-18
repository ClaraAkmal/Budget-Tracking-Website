import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Expense } from '../models/expense.model';
import { Income } from '../models/income.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private dbUrl = environment.firebase.databaseURL;

  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();

  private incomesSubject = new BehaviorSubject<Income[]>([]);
  incomes$ = this.incomesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private mapList<T>(data: {[key: string]: T} | null): T[] {
    return data ? Object.keys(data).map(k => ({ ...data[k], id: k } as any)) : [];
  }

  loadExpenses(userId: string): void {
    this.http.get<{[key: string]: Expense}>(
      `${this.dbUrl}/users/${userId}/expenses.json`
    ).pipe(map(d => this.mapList<Expense>(d)))
     .subscribe(list => this.expensesSubject.next(list));
  }

  addExpense(userId: string, expense: Omit<Expense, 'id'>): Observable<any> {
    return this.http.post(`${this.dbUrl}/users/${userId}/expenses.json`, expense)
      .pipe(tap(() => this.loadExpenses(userId)));
  }

  updateExpense(userId: string, expense: Expense): Observable<any> {
    return this.http.put(`${this.dbUrl}/users/${userId}/expenses/${expense.id}.json`, expense)
      .pipe(tap(() => this.loadExpenses(userId)));
  }

  deleteExpense(userId: string, id: string): Observable<any> {
    return this.http.delete(`${this.dbUrl}/users/${userId}/expenses/${id}.json`)
      .pipe(tap(() => this.loadExpenses(userId)));
  }

  loadIncomes(userId: string): void {
    this.http.get<{[key: string]: Income}>(
      `${this.dbUrl}/users/${userId}/incomes.json`
    ).pipe(map(d => this.mapList<Income>(d)))
     .subscribe(list => this.incomesSubject.next(list));
  }

  addIncome(userId: string, income: Omit<Income, 'id'>): Observable<any> {
    return this.http.post(`${this.dbUrl}/users/${userId}/incomes.json`, income)
      .pipe(tap(() => this.loadIncomes(userId)));
  }

  updateIncome(userId: string, income: Income): Observable<any> {
    return this.http.put(`${this.dbUrl}/users/${userId}/incomes/${income.id}.json`, income)
      .pipe(tap(() => this.loadIncomes(userId)));
  }

  deleteIncome(userId: string, id: string): Observable<any> {
    return this.http.delete(`${this.dbUrl}/users/${userId}/incomes/${id}.json`)
      .pipe(tap(() => this.loadIncomes(userId)));
  }
}