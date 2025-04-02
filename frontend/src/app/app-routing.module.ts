import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { SignupComponent } from './views/signup/signup.component';
import { JobDetailsComponent } from './views/job-details/job-details.component';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./views/home/home.module').then((m) => m.HomeModule),
  },
  { path: 'verify/:id/:token', component: HomeComponent },
  {
    path: 'signup',
    component: SignupComponent,
    data: { animation: 'isSignup' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'isLogin' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./views/profile/profile.module').then((m) => m.ProfileModule),
    data: { animation: 'isLeft' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'employers',
    loadChildren: () =>
      import('./views/employers/employers.module').then((m) => m.EmployersModule),
    data: { animation: 'isLeft' }
  },
  {
    path: 'jobPosts',
    loadChildren: () =>
      import('./views/job-posts/job-posts.module').then((m) => m.JobPostsModule),
    data: { animation: 'isTop' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'user/:id',
    loadChildren: () =>
      import('./views/profile/profile.module').then((m) => m.ProfileModule),
    data: { animation: 'isLeft' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'messaging',
    loadChildren: () =>
      import('./views/messaging/messaging.module').then((m) => m.MessagingModule),
    data: { animation: 'isMsg' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./views/notifications/notifications.module').then(m => m.NotificationsModule),
    data: { animation: 'isNotifications' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'saved-jobs',
    loadChildren: () =>
      import('./views/saved-jobs/saved-jobs.module').then(m => m.SavedJobsModule),
    data: { animation: 'isRight' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'job/:id',
    loadChildren: () =>
      import('./views/job-details/job-details.module').then(m => m.JobDetailsModule),
    data: { animation: 'isTop' },
  },
  {
    path: 'jobs-form',
    loadChildren: () =>
      import('./views/job-posts-form/job-posts-form.module').then(
        (m) => m.JobPostsFormModule
      ),
    data: { animation: 'isLeft' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'resetPassword/:token',
    component: ResetPasswordComponent,
    data: { animation: 'isLeft' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
