import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs';
import { BudgetService } from '../../../core/services/budget';
import { TransactionService } from '../../../core/services/transaction';
import { AuthService } from '../../../core/services/auth';
import { Budget } from '../../../core/models/budget.model';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.html',
  styleUrls: ['./budgets.css'],
  standalone: false
})
export class BudgetsComponent implements OnInit, OnDestroy {

  budgets: Budget[] = [];
  filteredBudgets: Budget[] = [];

  budgetForm!: FormGroup;
  showModal = false;
  editingBudget: Budget | null = null;
  isSubmitting = false;

  filterCategory = '';
  filterMonth = '';

  private userId = '';
  private sub!: Subscription;

  readonly categories = [
    'Food', 'Transport', 'Housing', 'Healthcare',
    'Entertainment', 'Education', 'Shopping', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.currentUser?.uid ?? '';
  if (!this.userId) return;

  
    this.sub = combineLatest([
      this.budgetService.budgets$,
      this.transactionService.expenses$
    ]).subscribe(([budgets, expenses]) => {
      this.budgetService.recalculateSpent(this.userId, expenses, budgets);
      this.budgets = budgets;
      this.applyFilters();
    });
  this.budgetService.loadBudgets(this.userId);
    this.transactionService.loadExpenses(this.userId);

    this.initForm();
  }

  private initForm(): void {
    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      limit:    ['', [Validators.required, Validators.min(1)]],
      month:    ['', Validators.required]
    });
  }

  applyFilters(): void {
    this.filteredBudgets = this.budgets.filter(b => {
      const matchCat   = this.filterCategory ? b.category === this.filterCategory : true;
      const matchMonth = this.filterMonth    ? b.month    === this.filterMonth    : true;
      return matchCat && matchMonth;
    });
  }

  openAddModal(): void {
    this.editingBudget = null;
    this.budgetForm.reset();
    this.showModal = true;
  }

  openEditModal(budget: Budget): void {
    this.editingBudget = budget;
    this.budgetForm.setValue({
      category: budget.category,
      limit:    budget.limit,
      month:    budget.month
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingBudget = null;
    this.budgetForm.reset();
  }

  onSubmit(): void {
    if (this.budgetForm.invalid) return;

    this.isSubmitting = true;
    const v = this.budgetForm.value;

    if (this.editingBudget) {
      const updated: Budget = {
        ...this.editingBudget,
        category: v.category,
        limit:    +v.limit,
        month:    v.month
      };
      this.budgetService.updateBudget(this.userId, updated).subscribe({
        next:  () => { this.isSubmitting = false; this.closeModal(); },
        error: () => { this.isSubmitting = false; }
      });
    } else {
      const newBudget: Budget = {
        userId:    this.userId,
        category:  v.category,
        limit:     +v.limit,
        month:     v.month,
        spent:     0,
        createdAt: new Date().toISOString()
      };
      this.budgetService.addBudget(this.userId, newBudget).subscribe({
        next:  () => { this.isSubmitting = false; this.closeModal(); },
        error: () => { this.isSubmitting = false; }
      });
    }
  }

  deleteBudget(budget: Budget): void {
    if (!confirm(`Delete budget for "${budget.category}"?`)) return;
    this.budgetService.deleteBudget(this.userId, budget.id!).subscribe();
  }

  getUsagePercent(budget: Budget): number {
    if (budget.limit === 0) return 0;
    return Math.min((budget.spent / budget.limit) * 100, 100);
  }

  getStatusClass(budget: Budget): string {
    const pct = this.getUsagePercent(budget);
    if (pct >= 100) return 'status-over';
    if (pct >= 80)  return 'status-warning';
    return 'status-ok';
  }

  trackByBudgetId(index: number, budget: Budget): string {
    return budget.id ?? index.toString();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}