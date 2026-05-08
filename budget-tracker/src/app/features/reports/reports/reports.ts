import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs';
import { TransactionService } from '../../../core/services/transaction';
import { BudgetService } from '../../../core/services/budget';
import { GoalService } from '../../../core/services/goal';
import { AuthService } from '../../../core/services/auth';
import { Expense } from '../../../core/models/expense.model';
import { Income } from '../../../core/models/income.model';
import { Budget } from '../../../core/models/budget.model';
import { Goal } from '../../../core/models/goal.model';
import { ReportData } from '../report-generator/report-generator.component';

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

interface GoalProgress {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  percentage: number;
  isCompleted: boolean;
  remaining: number;
  circumference: number;
  dashOffset: number;
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
  goalProgresses:     GoalProgress[]    = [];
 reportData: ReportData | null = null;

  // Savings summary KPIs
  totalSavingsTarget  = 0;
  totalSaved          = 0;
  completedGoals      = 0;
  overallSavingsRate  = 0;

  filterMonth = '';

  private userId = '';
  private sub!: Subscription;

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private goalService: GoalService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.userId = this.authService.currentUser?.uid ?? '';
    if (!this.userId) return;

    this.sub = combineLatest([
      this.transactionService.incomes$,
      this.transactionService.expenses$,
      this.budgetService.budgets$,
      this.goalService.goals$
    ]).subscribe(([incomes, expenses, budgets, goals]) => {
      this.calculate(incomes, expenses, budgets, goals);
      this.cdr.detectChanges();
    });

    this.transactionService.loadIncomes(this.userId);
    this.transactionService.loadExpenses(this.userId);
    this.budgetService.loadBudgets(this.userId);
    this.goalService.loadGoals(this.userId);
  }

  private calculate(
    incomes: Income[],
    expenses: Expense[],
    budgets: Budget[],
    goals: Goal[]
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

    //Totals 
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
        .filter(e => e.category === b.category && e.date.startsWith(b.month))
        .reduce((s, e) => s + e.amount, 0);
      const variance = b.limit - spent;
      return {
        category: b.category,
        month:    b.month,
        limit:    b.limit,
        spent,
        variance,
        status: spent >= b.limit ? 'over' : spent >= b.limit * 0.8 ? 'warning' : 'ok'
      };
    });

    // Savings progress (goals — not filtered by month, goals are ongoing) 
    const radius = 36;
    const circumference = 2 * Math.PI * radius;

    this.goalProgresses = goals.map(g => {
      const pct         = g.targetAmount > 0
        ? Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100)
        : 0;
      const isCompleted = pct >= 100;
      const dashOffset  = circumference - (pct / 100) * circumference;
      return {
        id:           g.id ?? '',
        title:        g.title,
        targetAmount: g.targetAmount,
        savedAmount:  g.savedAmount,
        deadline:     g.deadline,
        percentage:   pct,
        isCompleted,
        remaining:    Math.max(g.targetAmount - g.savedAmount, 0),
        circumference,
        dashOffset
      };
    }).sort((a, b) => b.percentage - a.percentage);

    this.totalSavingsTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    this.totalSaved         = goals.reduce((s, g) => s + g.savedAmount, 0);
    this.completedGoals     = goals.filter(g => g.savedAmount >= g.targetAmount).length;
    this.overallSavingsRate = this.totalSavingsTarget > 0
      ? Math.round((this.totalSaved / this.totalSavingsTarget) * 100)
      : 0;
      this.reportData = {
    generatedAt:   new Date().toLocaleString('en-US', {
      dateStyle: 'medium', timeStyle: 'short'
    }),
    periodLabel:   this.filterMonth
      ? new Date(this.filterMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })
      : 'All Time',
    totalIncome:       this.totalIncome,
    totalExpenses:     this.totalExpenses,
    balance:           this.balance,
    savingsRate:       this.savingsRate,
    expensesByCategory: this.expensesByCategory,
    incomeBySource:     this.incomeBySource,
    budgetVariances:    this.budgetVariances,
    goalProgresses:     this.goalProgresses,
    totalSaved:         this.totalSaved,
    totalSavingsTarget: this.totalSavingsTarget,
    overallSavingsRate: this.overallSavingsRate,
    completedGoals:     this.completedGoals
  };
}  
  

  applyMonthFilter(): void {
    this.sub.unsubscribe();
    this.sub = combineLatest([
      this.transactionService.incomes$,
      this.transactionService.expenses$,
      this.budgetService.budgets$,
      this.goalService.goals$
    ]).subscribe(([incomes, expenses, budgets, goals]) => {
      this.calculate(incomes, expenses, budgets, goals);
      this.cdr.detectChanges();
    });
  }

  clearFilter(): void {
    this.filterMonth = '';
    this.applyMonthFilter();
  }

  getVarianceClass(status: string): string {
    if (status === 'over')    return 'variance-over';
    if (status === 'warning') return 'variance-warning';
    return 'variance-ok';
  }

  getGoalRingColor(pct: number): string {
    if (pct >= 100) return '#22c55e';
    if (pct >= 75)  return '#6366f1';
    if (pct >= 50)  return '#f59e0b';
    return '#ef4444';
  }

  isDeadlineSoon(deadline: string): boolean {
    const days = (new Date(deadline).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 30;
  }

  isDeadlinePast(deadline: string): boolean {
    return new Date(deadline).getTime() < Date.now();
  }

  trackByCat(_: number, item: CategorySummary): string   { return item.category; }
  trackByVariance(_: number, item: BudgetVariance): string { return item.category + item.month; }
  trackByGoal(_: number, item: GoalProgress): string      { return item.id; }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}