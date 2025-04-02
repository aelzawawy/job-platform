import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobDetailsComponent } from './job-details.component';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
@NgModule({
  declarations: [JobDetailsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    RouterLink
  ],
  exports: [JobDetailsComponent]
})
export class JobDetailsModule { }