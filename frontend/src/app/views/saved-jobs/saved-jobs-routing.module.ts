import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SavedJobsComponent } from './saved-jobs.component';
import { AuthGuardService } from '../../services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: SavedJobsComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SavedJobsRoutingModule { }