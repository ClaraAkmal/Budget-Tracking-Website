import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionService } from '../../../core/services/transaction';
import { AuthService } from '../../../core/services/auth';
import { Income } from '../../../core/models/income.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-income',
  templateUrl: './income.html',
  styleUrls: ['./income.css'],
  standalone: false
})
export class IncomeComponent implements OnInit, OnDestroy {

  incomes: Income[] = [];
  filteredIncomes: Income[] = [];
  incomeForm!: FormGroup;
  showModal = false;
  editingIncome: Income | null = null;
  isSubmitting = false;
  searchTerm = '';
  filterSource = '';
  private userId = '';
  private sub!: Subscription;

  readonly sources = [
    'Salary', 'Freelance', 'Business', 'Investment',
    'Rental', 'Gift', 'Bonus', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.currentUser?.uid ?? '';
    if (!this.userId) return;

    this.sub = this.transactionService.incomes$.subscribe(data => {
      this.incomes = data;
      this.applyFilters();
      this.cdr.detectChanges();
    });

    this.transactionService.loadIncomes(this.userId);
    this.initForm();
  }

  private initForm(): void {
    this.incomeForm = this.fb.group({
      source:      ['', Validators.required],
      amount:      ['', [Validators.required, Validators.min(0.01)]],
      date:        ['', Validators.required],
      isRecurring: [false]
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredIncomes = this.incomes.filter(i => {
      const matchSearch = term ? i.source.toLowerCase().includes(term) : true;
      const matchSource = this.filterSource ? i.source === this.filterSource : true;
      return matchSearch && matchSource;
    });
  }

  openAddModal(): void {
    this.editingIncome = null;
    this.incomeForm.reset({ isRecurring: false });
    this.showModal = true;
  }

  openEditModal(income: Income): void {
    this.editingIncome = income;
    this.incomeForm.setValue({
      source:      income.source,
      amount:      income.amount,
      date:        income.date,
      isRecurring: income.isRecurring
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingIncome = null;
    this.incomeForm.reset({ isRecurring: false });
  }

  onSubmit(): void {
    if (this.incomeForm.invalid) return;
    this.isSubmitting = true;
    const v = this.incomeForm.value;

    if (this.editingIncome) {
      const updated: Income = {
        ...this.editingIncome,
        source: v.source, amount: +v.amount,
        date: v.date, isRecurring: v.isRecurring
      };
      this.transactionService.updateIncome(this.userId, updated).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.toast.success('Income Updated', `"${updated.source}" updated successfully.`);
        },
        error: () => {
          this.isSubmitting = false;
          this.toast.error('Update Failed', 'Something went wrong. Please try again.');
        }
      });
    } else {
      const newIncome: Income = {
        userId: this.userId, source: v.source,
        amount: +v.amount, date: v.date,
        isRecurring: v.isRecurring, createdAt: new Date().toISOString()
      };
      this.transactionService.addIncome(this.userId, newIncome).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.toast.success('Income Added', `"${newIncome.source}" added successfully.`);
        },
        error: () => {
          this.isSubmitting = false;
          this.toast.error('Add Failed', 'Something went wrong. Please try again.');
        }
      });
    }
  }

  deleteIncome(income: Income): void {
    this.confirmService.confirm({
      header: 'Delete Income',
      message: `Are you sure you want to delete "${income.source}"?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      onAccept: () => {
        this.transactionService.deleteIncome(this.userId, income.id!).subscribe({
          next: () => this.toast.warn('Deleted', `"${income.source}" has been deleted.`),
          error: () => this.toast.error('Delete Failed', 'Something went wrong.')
        });
      }
    });
  }

  getTotalIncome(): number {
    return this.filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  }

  trackByIncomeId(index: number, income: Income): string {
    return income.id ?? index.toString();
  }

  getRecurringIncomeCount(): number {
    return this.incomes.filter(i => i.isRecurring).length;
  }

  getUniqueSourceCount(): number {
    return new Set(this.incomes.map(i => i.source)).size;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}