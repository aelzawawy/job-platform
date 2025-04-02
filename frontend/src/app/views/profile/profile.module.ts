import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent, update_profile_image } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { EditProfileModule } from '../../edit-profile/edit-profile.module';
import { LoadersModule } from '../../loaders/loaders.module';
import { UserSearchModule } from '../user-search/user-search.module';

@NgModule({
  declarations: [
    ProfileComponent,
    update_profile_image
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    MaterialModule,
    FormsModule,
    EditProfileModule,
    LoadersModule,
    UserSearchModule
  ]
})
export class ProfileModule { }