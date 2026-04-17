import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Budgets } from './budgets/budgets';
import { BudgetFormDialog } from './budget-form-dialog/budget-form-dialog';

@NgModule({
  declarations: [Budgets, BudgetFormDialog],
  imports: [CommonModule],
})
export class BudgetsModule {}
