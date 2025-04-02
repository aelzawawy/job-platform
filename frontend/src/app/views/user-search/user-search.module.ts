import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSearchComponent } from './user-search.component';
import { MaterialModule } from '../../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadersModule } from '../../loaders/loaders.module';
import { UserSearchRoutingModule } from './user-search-routing.module';

@NgModule({
  declarations: [UserSearchComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    LoadersModule,
    UserSearchRoutingModule
  ],
  exports: [UserSearchComponent]
})
export class UserSearchModule { }