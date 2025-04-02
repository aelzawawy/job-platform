import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobPostsFormRoutingModule } from './job-posts-form-routing.module';
import { JobPostsFormComponent } from './job-posts-form.component';
import { EditorModule } from '../../shared/editor/editor.module';
import { MaterialModule } from '../../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [JobPostsFormComponent],
  imports: [
    CommonModule,
    JobPostsFormRoutingModule,
    EditorModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class JobPostsFormModule { }
