import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
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
import { MatDialogModule } from '@angular/material/dialog';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { JobApplicationsComponent } from './job-applications/job-applications.component';
import { UserProfileComponent } from './views/user-profile/user-profile.component';
import { SavedJobsComponent } from './views/saved-jobs/saved-jobs.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
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
    UserProfileComponent,
    SavedJobsComponent,
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
    MatDialogModule,
  ],
  providers: [
    AuthService,
    UserService,
    JobsService,
    // Multi provider service for tokens
    {
      provide:HTTP_INTERCEPTORS,
      useClass: TokenIntercepterService,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
