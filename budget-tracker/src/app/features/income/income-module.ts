import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Income } from './income/income';
import { IncomeFormDialog } from './income-form-dialog/income-form-dialog';

@NgModule({
  declarations: [Income, IncomeFormDialog],
  imports: [CommonModule],
})
export class IncomeModule {}
