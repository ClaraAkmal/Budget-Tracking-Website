import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { TransactionService } from '../../../core/services/transaction';
import { BudgetService } from '../../../core/services/budget';
import { GoalService } from '../../../core/services/goal';
import { AuthService } from '../../../core/services/auth';
import { Budget } from '../../../core/models/budget.model';
import { Goal } from '../../../core/models/goal.model';

interface Transaction {
  id?: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {

  totalIncome    = 0;
  totalExpenses  = 0;
  balance        = 0;
  activeGoals    = 0;

  topBudgets:         Budget[]      = [];
  topGoals:           Goal[]        = [];
  recentTransactions: Transaction[] = [];

  today = new Date();

  private userId = '';
  private subs = new Subscription();

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private goalService: GoalService,
    public  authService: AuthService,
    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    // ✅ currentUser$ is a BehaviorSubject — it replays the last value
    // synchronously on subscribe, so the user is available immediately
    // after login without any timing issues.
    const authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.initializeDashboard();
      }
    });
    // ✅ Track the auth subscription so it gets cleaned up on destroy
    this.subs.add(authSub);
  }

  private initializeDashboard(): void {
    // ✅ Subscribe to all data streams with combineLatest FIRST,
    // before calling the load methods. This guarantees we never
    // miss an emission even if HTTP responds synchronously (unlikely
    // but safe). combineLatest will emit as soon as all four subjects
    // have emitted at least one value — they all start as [] so
    // the first emission is [[], [], [], []] (instant), then real
    // data comes in as HTTP responses arrive.
  
    const dataSub = combineLatest([
      this.transactionService.incomes$,
      this.transactionService.expenses$,
      this.budgetService.budgets$,
      this.goalService.goals$
    ]).subscribe(([incomes, expenses, budgets, goals]) => {

      this.totalIncome   = incomes.reduce((s, i) => s + i.amount, 0);
      this.totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      this.balance       = this.totalIncome - this.totalExpenses;
      this.activeGoals   = goals.filter(g => this.getProgress(g) < 100).length;

      this.topBudgets = [...budgets]
        .sort((a, b) => this.getBudgetPct(b) - this.getBudgetPct(a))
        .slice(0, 4);
      this.cdr.detectChanges();
      this.topGoals = [...goals].slice(0, 3);

      const expTx: Transaction[] = expenses.map(e => ({
        id:          e.id,
        description: e.description,
        category:    e.category,
        amount:      e.amount,
        date:        e.date,
        type:        'expense' as const
      }));

      const incTx: Transaction[] = incomes.map(i => ({
        id:          i.id,
        description: i.source,
        category:    i.source,
        amount:      i.amount,
        date:        i.date,
        type:        'income' as const
      }));

      this.recentTransactions = [...expTx, ...incTx]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6);
    });

    // ✅ Add to the composite subscription — properly cleaned up on destroy
    this.subs.add(dataSub);

    // ✅ Trigger HTTP loads AFTER subscribing — ensures we catch the emission
    this.transactionService.loadIncomes(this.userId);
    this.transactionService.loadExpenses(this.userId);
    this.budgetService.loadBudgets(this.userId);
    this.goalService.loadGoals(this.userId);
  }

  getTimeOfDay(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  getBudgetPct(b: Budget): number {
    return b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
  }

  getBudgetFillClass(b: Budget): string {
    const p = this.getBudgetPct(b);
    return p >= 100 ? 'fill-over' : p >= 80 ? 'fill-warning' : 'fill-ok';
  }

  getBudgetAmountClass(b: Budget): string {
    const p = this.getBudgetPct(b);
    return p >= 100 ? 'color-over' : p >= 80 ? 'color-warning' : 'color-ok';
  }

  getBudgetStatusClass(b: Budget): string {
    const p = this.getBudgetPct(b);
    return p >= 100 ? 'badge-over' : p >= 80 ? 'badge-warning' : 'badge-ok';
  }

  getBudgetStatusLabel(b: Budget): string {
    const p = this.getBudgetPct(b);
    return p >= 100 ? 'Over' : p >= 80 ? 'Warning' : 'OK';
  }

  getProgress(g: Goal): number {
    return g.targetAmount > 0
      ? Math.min((g.savedAmount / g.targetAmount) * 100, 100)
      : 0;
  }

  getGoalPct(g: Goal): number {
    return this.getProgress(g);
  }

  getGoalColor(g: Goal): string {
    const p = this.getProgress(g);
    if (p >= 100) return '#22c55e';
    if (p >= 60)  return '#6366f1';
    if (p >= 30)  return '#f59e0b';
    return '#ef4444';
  }

  trackById(index: number, item: any): string {
    return item.id ?? index.toString();
  }

  ngOnDestroy(): void {
    // ✅ Single call unsubscribes ALL tracked subscriptions
    this.subs.unsubscribe();
  }
}