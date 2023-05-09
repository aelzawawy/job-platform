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
  jobId!:string;
  applicationIds!:object[];

  ngOnInit(): void {
    this.jobsService.getPassedJob().subscribe(job => {
      this.jobId = job._id;
      this.applicationIds = job.applictions?.map((el:any) => el._id) || [];
      this.applicants = job.applictions?.map((el:any) => el.applicant) || [];
    })
  }

  userProfile() {
    this.dialog.closeAll();
  }

  acceptOffer(id:any, appId:any){
    this.jobsService.acceptOffer(id, appId).subscribe({
      next: (res:any) => {
        console.log(res)
      },error: (e:any) => {
        console.log(e);
      }
    })
  }
  declineOffer(id:any, appId:any, i:number){
    this.applicants.splice(i, 1)
    this.jobsService.declineOffer(id, appId).subscribe({
      next: (res:any) => {
      },error: (e:any) => {
        console.log(e);
      }
    })
  }
}
