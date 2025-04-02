import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@NgModule({
  declarations: [],
  imports: [CommonModule, CKEditorModule],
  exports: [CKEditorModule],
})
export class EditorModule {}
