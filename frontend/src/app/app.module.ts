import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './views/home/home.component';
import { SignupComponent } from './views/signup/signup.component';
import { LoginComponent } from './views/login/login.component';
import { ProfileComponent } from './views/profile/profile.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './services/auth.service';
import { TokenIntercepterService } from './services/token-intercepter.service';
import { EmployersComponent } from './views/employers/employers.component';
import { UserService } from './services/user.service';
import { EmployersSignupComponent } from './views/employers-signup/employers-signup.component';
import { JobPostsComponent } from './views/job-posts/job-posts.component';
import { JobsService } from './services/jobs.service';
import { MessagingComponent } from './views/messaging/messaging.component';
import { JobDetailsComponent } from './views/job-details/job-details.component';
import { MaterialModule } from 'src/app/material/material.module';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { JobApplicationsComponent } from './job-applications/job-applications.component';
import { SavedJobsComponent } from './views/saved-jobs/saved-jobs.component';
import { AppNavigationComponent } from './app-navigation/app-navigation.component';
import { LayoutModule } from '@angular/cdk/layout';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { JobPostsFormComponent } from './views/job-posts-form/job-posts-form.component';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import { MapBoxComponent } from './map-box/map-box.component';
import { Loader1Component } from './loaders/loader1/loader1.component';
import { Loader2Component } from './loaders/loader2/loader2.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';
import { NotificationsComponent } from './views/notifications/notifications.component';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { DeleteChatComponent } from './delete-chat/delete-chat.component';
import { UserSearchComponent } from './views/user-search/user-search.component';
initializeApp(environment.firebase);
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignupComponent,
    LoginComponent,
    ProfileComponent,
    EmployersComponent,
    EmployersSignupComponent,
    JobPostsComponent,
    MessagingComponent,
    JobDetailsComponent,
    EditProfileComponent,
    JobApplicationsComponent,
    SavedJobsComponent,
    AppNavigationComponent,
    // JobsComponent,
    JobPostsFormComponent,
    ResetPasswordComponent,
    MapBoxComponent,
    Loader1Component,
    Loader2Component,
    NotificationsComponent,
    DateAgoPipe,
    DeleteChatComponent,
    UserSearchComponent,
  ],
  // entryComponents: [MessagingComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    LayoutModule,
    CKEditorModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:1000',
    }),
  ],
  providers: [
    AuthService,
    UserService,
    JobsService,
    // Multi provider service for tokens
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenIntercepterService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
