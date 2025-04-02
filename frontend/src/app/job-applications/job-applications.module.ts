import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadersModule } from '../loaders/loaders.module';
import { MaterialModule } from '../material/material.module';
import { JobApplicationsComponent } from './job-applications.component';

@NgModule({
  declarations: [JobApplicationsComponent],
  imports: [CommonModule, MaterialModule, RouterLink, LoadersModule],
  exports: [JobApplicationsComponent],
})
export class JobApplicationsModule {}
