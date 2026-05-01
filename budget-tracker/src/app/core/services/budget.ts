import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Budget } from '../models/budget.model';
import { environment } from '../../../environments/environment';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private dbUrl = environment.firebase.databaseURL;
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  budgets$ = this.budgetsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadBudgets(userId: string): void {
    this.http.get<{[key: string]: Budget}>(
      `${this.dbUrl}/users/${userId}/budgets.json`
    ).pipe(
      map(data => data ? Object.keys(data).map(k => ({ ...data[k], id: k })) : [])
    ).subscribe(budgets => this.budgetsSubject.next(budgets));
  }

  addBudget(userId: string, budget: Omit<Budget, 'id'>): Observable<any> {
    return this.http.post(
      `${this.dbUrl}/users/${userId}/budgets.json`, budget
    ).pipe(tap(() => this.loadBudgets(userId)));
  }

  updateBudget(userId: string, budget: Budget): Observable<any> {
    return this.http.put(
      `${this.dbUrl}/users/${userId}/budgets/${budget.id}.json`, budget
    ).pipe(tap(() => this.loadBudgets(userId)));
  }

  deleteBudget(userId: string, budgetId: string): Observable<any> {
    return this.http.delete(
      `${this.dbUrl}/users/${userId}/budgets/${budgetId}.json`
    ).pipe(tap(() => this.loadBudgets(userId)));
  }
  
recalculateSpent(userId: string, expenses: Expense[], budgets: Budget[]): void {
  budgets.forEach(budget => {
    const spent = expenses
      .filter(e =>
        e.category === budget.category &&
        e.date.startsWith(budget.month)
      )
      .reduce((sum, e) => sum + e.amount, 0);

    if (spent !== budget.spent) {
      const updated: Budget = { ...budget, spent };
      this.updateBudget(userId, updated).subscribe();
    }
  });
}
getBudgetsValue(): Budget[] {
  return this.budgetsSubject.value;
}
clear(): void {
  this.budgetsSubject.next([]);
}
}