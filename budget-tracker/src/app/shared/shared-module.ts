import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar';
import { Spinner } from './spinner/spinner';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';

@NgModule({
  declarations: [NavbarComponent, Spinner, CurrencyFormatPipe],
  imports: [CommonModule],
  exports: [NavbarComponent, Spinner, CurrencyFormatPipe]
})
export class SharedModule {}