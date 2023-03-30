import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { JobsService } from '../services/jobs.service';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../interfaces/user';
@Component({
  selector: 'app-job-applications',
  templateUrl: './job-applications.component.html',
  styleUrls: ['./job-applications.component.scss'],
})
export class JobApplicationsComponent implements OnInit {
  constructor(
    private jobsService: JobsService,
    private userService: UserService,
    public dialog: MatDialog
  ) {}
  applicants: User[] = [];
  currUser: User = {}
  jobId = this.jobsService.jobId;
  applicationIds = this.jobsService.applicationId;

  ngOnInit(): void {
    const users = this.jobsService.users;
    users.forEach((user: any) => {
      this.userService.profileById(user).subscribe({
        next: (res: any) => {
          this.applicants.push(res);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    });
  }

  userProfile(e: any, index: any) {
    this.jobsService.getUser(this.applicants[index]);
    this.dialog.closeAll();
  }

  acceptOffer(id:any, appId:any){
    console.log(id);
    console.log(appId);
    this.jobsService.acceptOffer(id, appId).subscribe({
      next: (res:any) => {
        console.log(res);
      },error: (e:any) => {
        console.log(e);
      }
    })
  }
  declineOffer(id:any, appId:any){
    this.jobsService.declineOffer(id, appId).subscribe({
      next: (res:any) => {
        console.log(res);
      },error: (e:any) => {
        console.log(e);
      }
    })
  }
}
