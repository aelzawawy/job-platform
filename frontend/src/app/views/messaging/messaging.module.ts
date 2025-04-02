import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadersModule } from '../../loaders/loaders.module';
import { MaterialModule } from '../../material/material.module';
import { EditorModule } from '../../shared/editor/editor.module';
import { DateAgoModule } from '../../shared/pipes/date-ago.module';
import { MessagingRoutingModule } from './messaging-routing.module';
import { MessagingComponent } from './messaging.component';

@NgModule({
  declarations: [MessagingComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    LoadersModule,
    MessagingRoutingModule,
    EditorModule,
    DateAgoModule,
  ],
})
export class MessagingModule {}
