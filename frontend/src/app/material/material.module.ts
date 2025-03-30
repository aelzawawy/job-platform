import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';

const components = [
  MatToolbarModule,
  MatButtonModule,
  MatMenuModule,
  MatIconModule,
  MatDialogModule,
  MatInputModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatTabsModule,
  MatListModule,
  MatSelectModule,
  MatCheckboxModule,
  MatBadgeModule,
  MatRippleModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatExpansionModule,
];
@NgModule({
  imports: [components],
  exports: [components],
})
export class MaterialModule {}
