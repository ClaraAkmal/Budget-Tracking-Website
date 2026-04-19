import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExpensesComponent } from './expenses/expenses';
const routes: Routes = [
  { path: '', component: ExpensesComponent }
];

@NgModule({
  declarations: [ExpensesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ExpensesModule {}