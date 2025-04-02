import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { UserSearchModule } from '../views/user-search/user-search.module';
import { AppNavigationComponent } from './app-navigation.component';
import { LoadersModule } from '../loaders/loaders.module';

@NgModule({
  declarations: [AppNavigationComponent],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    UserSearchModule,
    LoadersModule
  ],
  exports: [AppNavigationComponent],
})
export class AppNavigationModule {}
