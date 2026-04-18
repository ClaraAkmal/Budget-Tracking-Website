import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TransactionService } from '../../../core/services/transaction';
import { BudgetService } from '../../../core/services/budget';
import { GoalService } from '../../../core/services/goal';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  standalone: false,
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;
  goalsCount = 0;
  private subs = new Subscription();

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private goalService: GoalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.currentUser?.uid;
    if (!userId) return;

    this.transactionService.loadExpenses(userId);
    this.transactionService.loadIncomes(userId);
    this.budgetService.loadBudgets(userId);
    this.goalService.loadGoals(userId);

    this.subs.add(this.transactionService.incomes$.subscribe(
      list => this.totalIncome = list.reduce((s, i) => s + i.amount, 0)
    ));
    this.subs.add(this.transactionService.expenses$.subscribe(
      list => this.totalExpenses = list.reduce((s, e) => s + e.amount, 0)
    ));
    this.subs.add(this.transactionService.expenses$.subscribe(
      () => this.balance = this.totalIncome - this.totalExpenses
    ));
    this.subs.add(this.goalService.goals$.subscribe(
      list => this.goalsCount = list.length
    ));
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }
}