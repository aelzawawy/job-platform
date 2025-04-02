import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobPostsComponent } from './job-posts.component';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { LoadersModule } from '../../loaders/loaders.module';
import { JobDetailsModule } from '../job-details/job-details.module';
import { JobApplicationsModule } from 'src/app/job-applications/job-applications.module';
import { JobPostsRoutingModule } from './job-posts-routing.module';

@NgModule({
  declarations: [JobPostsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    JobDetailsModule,
    JobApplicationsModule,
    JobPostsRoutingModule,
    LoadersModule
  ],
  exports: [JobPostsComponent]
})
export class JobPostsModule { }