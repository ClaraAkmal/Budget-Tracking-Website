import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: false
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, currencySymbol: string = '$'): string {
    if (value === null || value === undefined || isNaN(value)) return `${currencySymbol}0.00`;
    const formatted = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return value < 0
      ? `-${currencySymbol}${formatted}`
      : `${currencySymbol}${formatted}`;
  }
}