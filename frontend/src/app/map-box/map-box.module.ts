import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapBoxComponent } from './map-box.component';
import { MapBoxRoutingModule } from './map-box-routing.module';

@NgModule({
  declarations: [MapBoxComponent],
  imports: [
    CommonModule,
    MapBoxRoutingModule
  ],
  exports: [MapBoxComponent]
})
export class MapBoxModule { }
