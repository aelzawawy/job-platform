import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { ProfileComponent } from './views/profile/profile.component';
import { SignupComponent } from './views/signup/signup.component';
import { AuthGuardService } from './services/auth-guard.service';
import { EmployersComponent } from './views/employers/employers.component';
import { EmployersSignupComponent } from './views/employers-signup/employers-signup.component';
import { JobPostsComponent } from './views/job-posts/job-posts.component';
import { MessagingComponent } from './views/messaging/messaging.component';
import { SavedJobsComponent } from './views/saved-jobs/saved-jobs.component';
// import { JobsComponent } from './views/jobs/jobs.component';
import { JobPostsFormComponent } from './views/job-posts-form/job-posts-form.component';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import { JobDetailsComponent } from './views/job-details/job-details.component';

const routes: Routes = [
  {path:'', component:HomeComponent},
  {path:'verify/:id/:token', component:HomeComponent},
  // {path:'jobs', component:JobsComponent, data:{animation:'jobs'}},
  {path:'signup', component:SignupComponent, data:{animation:'isSignup'}, canActivate:[AuthGuardService]},
  {path:'login', component:LoginComponent, data:{animation:'isLogin'}, canActivate:[AuthGuardService]},
  {path:'profile', component:ProfileComponent, data:{animation:'isLeft'}, canActivate:[AuthGuardService]},
  {path:'user/:id', component:ProfileComponent, data:{animation:'isLeft'}, canActivate:[AuthGuardService]},
  {path:'employers', component:EmployersComponent, data:{animation:'isLeft'}},
  {path: 'employers-signup', component:EmployersSignupComponent, data:{animation:'isRight'}, canActivate:[AuthGuardService]},
  {path: 'jobPosts', component:JobPostsComponent, data:{animation:'isTop'}, canActivate:[AuthGuardService]},
  {path: 'messaging', component:MessagingComponent, data:{animation:'isMsg'}, canActivate:[AuthGuardService]},
  {path: 'saved-jobs', component:SavedJobsComponent, data:{animation:'isRight'}, canActivate:[AuthGuardService]},
  {path: 'jobs-form', component:JobPostsFormComponent, data:{animation:'isLeft'}, canActivate:[AuthGuardService]},
  {path: 'resetPassword/:token', component:ResetPasswordComponent, data:{animation:'isLeft'}},
  {path: 'job/:id', component:JobDetailsComponent, data:{animation:'isTop'}},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
