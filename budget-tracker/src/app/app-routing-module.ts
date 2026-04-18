import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule) },
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  { path: 'budgets', loadChildren: () => import('./features/budgets/budgets-module').then(m => m.BudgetsModule), canActivate: [AuthGuard] },
  { path: 'expenses', loadChildren: () => import('./features/expenses/expenses-module').then(m => m.ExpensesModule), canActivate: [AuthGuard] },
  { path: 'income', loadChildren: () => import('./features/income/income-module').then(m => m.IncomeModule), canActivate: [AuthGuard] },
  { path: 'goals', loadChildren: () => import('./features/goals/goals-module').then(m => m.GoalsModule), canActivate: [AuthGuard] },
  { path: 'reports', loadChildren: () => import('./features/reports/reports-module').then(m => m.ReportsModule), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}