import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar';
import { Spinner } from './spinner/spinner';

@NgModule({
  declarations: [NavbarComponent, Spinner],
  imports: [CommonModule, RouterModule],
  exports: [NavbarComponent, Spinner]
})
export class SharedModule {}