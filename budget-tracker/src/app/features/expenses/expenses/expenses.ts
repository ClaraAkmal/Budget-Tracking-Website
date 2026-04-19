import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionService } from '../../../core/services/transaction';
import { AuthService } from '../../../core/services/auth';
import { Expense } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css'],
  standalone: false
})
export class ExpensesComponent implements OnInit, OnDestroy {

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];

  expenseForm!: FormGroup;
  showModal = false;
  editingExpense: Expense | null = null;
  isSubmitting = false;

  searchTerm = '';
  filterCategory = '';

  private userId = '';
  private sub!: Subscription;

  readonly categories = [
    'Food', 'Transport', 'Housing', 'Healthcare',
    'Entertainment', 'Education', 'Shopping', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.currentUser?.uid ?? '';
    this.transactionService.loadExpenses(this.userId);

    this.sub = this.transactionService.expenses$.subscribe(data => {
      this.expenses = data;
      this.applyFilters();
    });

    this.initForm();
  }

  private initForm(): void {
    this.expenseForm = this.fb.group({
      category:    ['', Validators.required],
      amount:      ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      date:        ['', Validators.required],
      isRecurring: [false]
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredExpenses = this.expenses.filter(e => {
      const matchSearch = term
        ? e.description.toLowerCase().includes(term) ||
          e.category.toLowerCase().includes(term)
        : true;
      const matchCat = this.filterCategory
        ? e.category === this.filterCategory
        : true;
      return matchSearch && matchCat;
    });
  }

  openAddModal(): void {
    this.editingExpense = null;
    this.expenseForm.reset({ isRecurring: false });
    this.showModal = true;
  }

  openEditModal(expense: Expense): void {
    this.editingExpense = expense;
    this.expenseForm.setValue({
      category:    expense.category,
      amount:      expense.amount,
      description: expense.description,
      date:        expense.date,
      isRecurring: expense.isRecurring
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingExpense = null;
    this.expenseForm.reset({ isRecurring: false });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) return;

    this.isSubmitting = true;
    const v = this.expenseForm.value;

    if (this.editingExpense) {
      const updated: Expense = {
        ...this.editingExpense,
        category:    v.category,
        amount:      +v.amount,
        description: v.description,
        date:        v.date,
        isRecurring: v.isRecurring
      };
      this.transactionService.updateExpense(this.userId, updated).subscribe({
        next:  () => { this.isSubmitting = false; this.closeModal(); },
        error: () => { this.isSubmitting = false; }
      });
    } else {
      const newExpense: Expense = {
        userId:      this.userId,
        category:    v.category,
        amount:      +v.amount,
        description: v.description,
        date:        v.date,
        isRecurring: v.isRecurring,
        createdAt:   new Date().toISOString()
      };
      this.transactionService.addExpense(this.userId, newExpense).subscribe({
        next:  () => { this.isSubmitting = false; this.closeModal(); },
        error: () => { this.isSubmitting = false; }
      });
    }
  }

  deleteExpense(expense: Expense): void {
    if (!confirm(`Delete "${expense.description}"?`)) return;
    this.transactionService.deleteExpense(this.userId, expense.id!).subscribe();
  }

  trackByExpenseId(index: number, expense: Expense): string {
    return expense.id ?? index.toString();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}