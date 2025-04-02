import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobPostsFormComponent } from './job-posts-form.component';

const routes: Routes = [
  {
    path: '', // Default route for this module
    component: JobPostsFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobPostsFormRoutingModule { }
