import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployersComponent } from './employers.component';
import { EmployersSignupComponent } from '../employers-signup/employers-signup.component';
import { MaterialModule } from '../../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployersRoutingModule } from './employers-routing.module';

@NgModule({
  declarations: [EmployersComponent, EmployersSignupComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    EmployersRoutingModule,
    ReactiveFormsModule
  ]
})
export class EmployersModule { }