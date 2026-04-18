import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared-module';
import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}