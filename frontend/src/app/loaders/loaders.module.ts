import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Loader1Component } from './loader1/loader1.component';
import { Loader2Component } from './loader2/loader2.component';

@NgModule({
  declarations: [Loader1Component, Loader2Component],
  imports: [CommonModule],
  exports: [Loader1Component, Loader2Component],
})
export class LoadersModule {}