import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expenses } from './expenses/expenses';
import { ExpenseFormDialog } from './expense-form-dialog/expense-form-dialog';

@NgModule({
  declarations: [Expenses, ExpenseFormDialog],
  imports: [CommonModule],
})
export class ExpensesModule {}
