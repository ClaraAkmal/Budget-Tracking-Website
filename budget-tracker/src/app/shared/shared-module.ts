import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from './navbar/navbar';
import { Spinner } from './spinner/spinner';

@NgModule({
  declarations: [Navbar, Spinner],
  imports: [CommonModule],
})
export class SharedModule {}
