import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransactionService } from './transaction';
import { BudgetService } from './budget';

export interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: { category: string; total: number }[];
  budgetVariance: { category: string; limit: number; spent: number; variance: number }[];
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  report$: Observable<ReportData>;

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService
  ) {
    this.report$ = combineLatest([
      this.transactionService.incomes$,
      this.transactionService.expenses$,
      this.budgetService.budgets$
    ]).pipe(
      map(([incomes, expenses, budgets]) => {
        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        const expensesByCategory = expenses.reduce((acc, e) => {
          const existing = acc.find(x => x.category === e.category);
          if (existing) existing.total += e.amount;
          else acc.push({ category: e.category, total: e.amount });
          return acc;
        }, [] as { category: string; total: number }[]);

        const budgetVariance = budgets.map(b => ({
          category: b.category,
          limit: b.limit,
          spent: b.spent,
          variance: b.limit - b.spent
        }));

        return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, expensesByCategory, budgetVariance };
      })
    );
  }
}