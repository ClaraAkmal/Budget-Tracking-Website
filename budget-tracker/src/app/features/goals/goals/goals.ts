import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GoalService } from '../../../core/services/goal';
import { AuthService } from '../../../core/services/auth';
import { Goal } from '../../../core/models/goal.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.html',
  styleUrls: ['./goals.css'],
  standalone: false
})
export class GoalsComponent implements OnInit, OnDestroy {

  goals: Goal[] = [];

  goalForm!: FormGroup;
  showModal = false;
  editingGoal: Goal | null = null;
  isSubmitting = false;

  private userId = '';
  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private goalService: GoalService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.currentUser?.uid ?? '';
    if (!this.userId) return;

    this.sub = this.goalService.goals$.subscribe(data => {
      this.goals = data;
      this.cdr.detectChanges();
    });

    this.goalService.loadGoals(this.userId);
    this.initForm();
  }

  private initForm(): void {
    this.goalForm = this.fb.group({
      title:        ['', Validators.required],
      targetAmount: ['', [Validators.required, Validators.min(1)]],
      savedAmount:  ['', [Validators.required, Validators.min(0)]],
      deadline:     ['', Validators.required]
    });
  }

  getProgress(goal: Goal): number {
    if (goal.targetAmount === 0) return 0;
    return Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  }

  getProgressColor(goal: Goal): string {
    const pct = this.getProgress(goal);
    if (pct >= 100) return '#22c55e';
    if (pct >= 60)  return '#6366f1';
    if (pct >= 30)  return '#f59e0b';
    return '#ef4444';
  }

  getStatusLabel(goal: Goal): string {
    const pct = this.getProgress(goal);
    if (pct >= 100) return 'Completed';
    if (pct >= 60)  return 'On Track';
    if (pct >= 30)  return 'In Progress';
    return 'Just Started';
  }

  getStatusClass(goal: Goal): string {
    const pct = this.getProgress(goal);
    if (pct >= 100) return 'status-complete';
    if (pct >= 60)  return 'status-on-track';
    if (pct >= 30)  return 'status-in-progress';
    return 'status-started';
  }

  getRemainingAmount(goal: Goal): number {
    return Math.max(goal.targetAmount - goal.savedAmount, 0);
  }

  openAddModal(): void {
    this.editingGoal = null;
    this.goalForm.reset();
    this.showModal = true;
  }

  openEditModal(goal: Goal): void {
    this.editingGoal = goal;
    this.goalForm.setValue({
      title:        goal.title,
      targetAmount: goal.targetAmount,
      savedAmount:  goal.savedAmount,
      deadline:     goal.deadline
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingGoal = null;
    this.goalForm.reset();
  }

  onSubmit(): void {
    if (this.goalForm.invalid) return;

    this.isSubmitting = true;
    const v = this.goalForm.value;

    if (this.editingGoal) {
      const updated: Goal = {
        ...this.editingGoal,
        title:        v.title,
        targetAmount: +v.targetAmount,
        savedAmount:  +v.savedAmount,
        deadline:     v.deadline
      };
      this.goalService.updateGoal(this.userId, updated).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.toast.success(
            'Goal Updated',
            `"${updated.title}" updated successfully.`
          );
        },
        error: () => {
          this.isSubmitting = false;
          this.toast.error('Update Failed', 'Something went wrong. Please try again.');
        }
      });
    } else {
      const newGoal: Goal = {
        userId:       this.userId,
        title:        v.title,
        targetAmount: +v.targetAmount,
        savedAmount:  +v.savedAmount,
        deadline:     v.deadline,
        createdAt:    new Date().toISOString()
      };
      this.goalService.addGoal(this.userId, newGoal).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.toast.success(
            'Goal Created',
            `"${newGoal.title}" created successfully.`
          );
        },
        error: () => {
          this.isSubmitting = false;
          this.toast.error('Create Failed', 'Something went wrong. Please try again.');
        }
      });
    }
  }

  deleteGoal(goal: Goal): void {
    this.confirmService.confirm({
      header: 'Delete Goal',
      message: `Are you sure you want to delete "${goal.title}"?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      onAccept: () => {
        this.goalService.deleteGoal(this.userId, goal.id!).subscribe({
          next: () => {
            this.toast.warn(
              'Goal Deleted',
              `"${goal.title}" has been deleted.`
            );
          },
          error: () => {
            this.toast.error('Delete Failed', 'Something went wrong. Please try again.');
          }
        });
      }
    });
  }

  trackByGoalId(index: number, goal: Goal): string {
    return goal.id ?? index.toString();
  }

  getCompletedCount(): number {
    return this.goals.filter(g => this.getProgress(g) >= 100).length;
  }

  getTotalSaved(): number {
    return this.goals.reduce((sum, g) => sum + g.savedAmount, 0);
  }

  getTotalRemaining(): number {
    return this.goals.reduce((s, g) => s + this.getRemainingAmount(g), 0);
  }

  getRingOffset(goal: Goal): number {
    const circumference = 201;
    return circumference - (this.getProgress(goal) / 100) * circumference;
  }

  getDaysRemaining(goal: Goal): number {
    const diff = new Date(goal.deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDaysClass(goal: Goal): string {
    const d = this.getDaysRemaining(goal);
    if (d < 0)  return 'days-past';
    if (d < 30) return 'days-soon';
    return 'days-ok';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}