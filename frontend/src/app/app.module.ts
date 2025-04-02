import { LayoutModule } from '@angular/cdk/layout';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppNavigationModule } from './app-navigation/app-navigation.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DeleteChatComponent } from './delete-chat/delete-chat.component';
import { EditProfileModule } from './edit-profile/edit-profile.module';
import { JobApplicationsComponent } from './job-applications/job-applications.component';
import { LoadersModule } from './loaders/loaders.module';
import { MaterialModule } from './material/material.module';
import { AuthService } from './services/auth.service';
import { JobsService } from './services/jobs.service';
import { TokenIntercepterService } from './services/token-intercepter.service';
import { UserService } from './services/user.service';
import { JobDetailsModule } from './views/job-details/job-details.module';
import { JobPostsModule } from './views/job-posts/job-posts.module';
import { LoginComponent } from './views/login/login.component';
import { MessagingModule } from './views/messaging/messaging.module';
import { NotificationsModule } from './views/notifications/notifications.module';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import { SavedJobsModule } from './views/saved-jobs/saved-jobs.module';
import { SignupComponent } from './views/signup/signup.component';
import { UserSearchModule } from './views/user-search/user-search.module';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    ResetPasswordComponent,
    DeleteChatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    MaterialModule,
    LoadersModule,
    UserSearchModule,
    JobDetailsModule,
    EditProfileModule,
    SavedJobsModule,
    NotificationsModule,
    MessagingModule,
    JobPostsModule,
    AppNavigationModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:1000',
    }),
  ],
  providers: [
    AuthService,
    UserService,
    JobsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenIntercepterService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
