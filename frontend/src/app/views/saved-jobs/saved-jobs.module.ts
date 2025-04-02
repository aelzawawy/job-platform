import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadersModule } from '../../loaders/loaders.module';
import { MaterialModule } from '../../material/material.module';
import { JobDetailsModule } from '../job-details/job-details.module';
import { SavedJobsComponent } from './saved-jobs.component';

@NgModule({
  declarations: [SavedJobsComponent],
  imports: [CommonModule, MaterialModule, JobDetailsModule, LoadersModule],
})
export class SavedJobsModule {}
