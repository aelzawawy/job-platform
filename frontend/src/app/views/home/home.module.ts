import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadersModule } from '../../loaders/loaders.module';
import { MapBoxModule } from '../../map-box/map-box.module';
import { MaterialModule } from '../../material/material.module';
import { JobDetailsModule } from '../job-details/job-details.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MapBoxModule,
    MaterialModule,
    FormsModule,
    JobDetailsModule,
    LoadersModule,
  ],
})
export class HomeModule {}
