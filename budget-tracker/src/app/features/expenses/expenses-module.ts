import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExpensesComponent } from './expenses/expenses';

// PrimeNG
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

const routes: Routes = [
  { path: '', component: ExpensesComponent }
];

@NgModule({
  declarations: [ExpensesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ToastModule,
    ConfirmDialogModule,
  ]
})
export class ExpensesModule {}