import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BudgetsComponent } from './budgets/budgets';

// PrimeNG
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

const routes: Routes = [
  { path: '', component: BudgetsComponent }
];

@NgModule({
  declarations: [BudgetsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ToastModule,
    ConfirmDialogModule,
  ]
})
export class BudgetsModule {}