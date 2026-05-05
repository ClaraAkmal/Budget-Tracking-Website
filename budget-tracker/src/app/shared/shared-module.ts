import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [NavbarComponent, CurrencyFormatPipe],
  imports: [CommonModule,RouterModule],
  exports: [NavbarComponent, CurrencyFormatPipe]
})
export class SharedModule {}