import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadersModule } from '../../loaders/loaders.module';
import { MaterialModule } from '../../material/material.module';
import { DateAgoModule } from '../../shared/pipes/date-ago.module';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    MaterialModule,
    FormsModule,
    LoadersModule,
    DateAgoModule,
  ],
})
export class NotificationsModule {}
