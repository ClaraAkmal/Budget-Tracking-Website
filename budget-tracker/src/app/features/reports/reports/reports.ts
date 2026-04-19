import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs';
import { TransactionService } from '../../../core/services/transaction';
import { BudgetService } from '../../../core/services/budget';
import { AuthService } from '../../../core/services/auth';
import { Expense } from '../../../core/models/expense.model';
import { Income } from '../../../core/models/income.model';
import { Budget } from '../../../core/models/budget.model';

interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

interface BudgetVariance {
  category: string;
  month: string;
  limit: number;
  spent: number;
  variance: number;
  status: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
  standalone: false
})
export class ReportsComponent implements OnInit, OnDestroy {

  totalIncome    = 0;
  totalExpenses  = 0;
  balance        = 0;
  savingsRate    = 0;

  expensesByCategory: CategorySummary[] = [];
  incomeBySource:     CategorySummary[] = [];
  budgetVariances:    BudgetVariance[]  = [];

  filterMonth = '';

  private userId = '';
  private sub!: Subscription;

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.currentUser?.uid ?? '';

    this.transactionService.loadIncomes(this.userId);
    this.transactionService.loadExpenses(this.userId);
    this.budgetService.loadBudgets(this.userId);

    this.sub = combineLatest([
      this.transactionService.incomes$,
      this.transactionService.expenses$,
      this.budgetService.budgets$
    ]).subscribe(([incomes, expenses, budgets]) => {
      this.calculate(incomes, expenses, budgets);
    });
  }

  private calculate(
    incomes: Income[],
    expenses: Expense[],
    budgets: Budget[]
  ): void {
    const filteredIncomes  = this.filterMonth
      ? incomes.filter(i  => i.date.startsWith(this.filterMonth))
      : incomes;
    const filteredExpenses = this.filterMonth
      ? expenses.filter(e => e.date.startsWith(this.filterMonth))
      : expenses;
    const filteredBudgets  = this.filterMonth
      ? budgets.filter(b  => b.month === this.filterMonth)
      : budgets;

    // Totals
    this.totalIncome   = filteredIncomes.reduce((s, i) => s + i.amount, 0);
    this.totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    this.balance       = this.totalIncome - this.totalExpenses;
    this.savingsRate   = this.totalIncome > 0
      ? Math.round((this.balance / this.totalIncome) * 100)
      : 0;

    // Expenses by category
    const expCatMap = new Map<string, number>();
    filteredExpenses.forEach(e => {
      expCatMap.set(e.category, (expCatMap.get(e.category) ?? 0) + e.amount);
    });
    this.expensesByCategory = Array.from(expCatMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: this.totalExpenses > 0
          ? Math.round((amount / this.totalExpenses) * 100)
          : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Income by source
    const incSrcMap = new Map<string, number>();
    filteredIncomes.forEach(i => {
      incSrcMap.set(i.source, (incSrcMap.get(i.source) ?? 0) + i.amount);
    });
    this.incomeBySource = Array.from(incSrcMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: this.totalIncome > 0
          ? Math.round((amount / this.totalIncome) * 100)
          : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Budget variance
    this.budgetVariances = filteredBudgets.map(b => {
      const spent = filteredExpenses
        .filter(e =>
          e.category === b.category &&
          e.date.startsWith(b.month)
        )
        .reduce((s, e) => s + e.amount, 0);
      const variance = b.limit - spent;
      return {
        category: b.category,
        month:    b.month,
        limit:    b.limit,
        spent,
        variance,
        status:   spent >= b.limit ? 'over' : spent >= b.limit * 0.8 ? 'warning' : 'ok'
      };
    });
  }

  applyMonthFilter(): void {
    // Re-trigger by re-subscribing is not needed —
    // just recall calculate with latest data by
    // unsubscribing and resubscribing
    this.sub.unsubscribe();
    this.sub = combineLatest([
      this.transactionService.incomes$,
      this.transactionService.expenses$,
      this.budgetService.budgets$
    ]).subscribe(([incomes, expenses, budgets]) => {
      this.calculate(incomes, expenses, budgets);
    });
  }

  clearFilter(): void {
    this.filterMonth = '';
    this.applyMonthFilter();
  }

  getBarWidth(percentage: number): string {
    return percentage + '%';
  }

  getVarianceClass(status: string): string {
    if (status === 'over')    return 'variance-over';
    if (status === 'warning') return 'variance-warning';
    return 'variance-ok';
  }

  trackByCat(index: number, item: CategorySummary): string {
    return item.category;
  }

  trackByVariance(index: number, item: BudgetVariance): string {
    return item.category + item.month;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}