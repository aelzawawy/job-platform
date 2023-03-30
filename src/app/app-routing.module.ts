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
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { UserProfileComponent } from './views/user-profile/user-profile.component';
import { SavedJobsComponent } from './views/saved-jobs/saved-jobs.component';

const routes: Routes = [
  {path:'', component:HomeComponent, data:{animation:'isHome'}},
  {path:'signup', component:SignupComponent, data:{animation:'isRight'}},
  {path:'login', component:LoginComponent, data:{animation:'isRight'}},
  {path:'profile', component:ProfileComponent, data:{animation:'isLeft'}, canActivate:[AuthGuardService]},
  {path:'profile/:id', component:UserProfileComponent, data:{animation:'isRight'}, canActivate:[AuthGuardService]},
  {path:'employers', component:EmployersComponent, data:{animation:'isLeft'}},
  {path: 'employers-signup', component:EmployersSignupComponent, data:{animation:'isRight'}},
  {path: 'jobPosts', component:JobPostsComponent, data:{animation:'isTop'}, canActivate:[AuthGuardService]},
  {path: 'messaging', component:MessagingComponent, data:{animation:'isMsg'}, canActivate:[AuthGuardService]},
  {path: 'saved-jobs', component:SavedJobsComponent, data:{animation:'isRight'}}
  // {path: 'profile/:edit', component:EditProfileComponent, data:{animation:'isLeft'}},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
