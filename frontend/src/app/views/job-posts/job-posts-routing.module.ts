import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobPostsComponent } from './job-posts.component';
import { AuthGuardService } from '../../services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: JobPostsComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobPostsRoutingModule { }