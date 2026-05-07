import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { RouterModule } from '@angular/router';
import { ToastComponent } from './toast/toast.component';
import { ConfirmDialogComponent } from './confirm/confirm-dialog.component';

@NgModule({
  declarations: [
    NavbarComponent,
    CurrencyFormatPipe,
    ToastComponent,
    ConfirmDialogComponent
  ],
  imports: [CommonModule, RouterModule],
  exports: [
    NavbarComponent,
    CurrencyFormatPipe,
    ToastComponent,
    ConfirmDialogComponent
  ]
})
export class SharedModule {}