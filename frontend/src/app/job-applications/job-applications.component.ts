import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from '../services/user.service';
import { JobsService } from '../services/jobs.service';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../interfaces/user';
import { JobPost } from '../interfaces/job-post';
import { take, tap } from 'rxjs';
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
  currUser: User = {};
  jobId!: string;
  applicationIds!: object[];
  @Output() closeApplications = new EventEmitter<boolean>();
  ngOnInit(): void {
    this.jobsService.jobId$.pipe(take(1)).subscribe((id) => {
      this.jobId = id;
    });
    this.jobsService.jobs$.subscribe((jobs) => {
      const job: JobPost = jobs.find((job) => job._id == this.jobId) || {};
      this.applicationIds = job.applictions?.map((el: any) => el._id) || [];
      this.applicants = job.applictions?.map((el: any) => el.applicant) || [];
    });
  }
  close() {
    this.closeApplications.emit();
    this.jobsService.closeApplicants$.next(true);
  }
  userProfile() {
    this.dialog.closeAll();
  }

  acceptOffer(id: any, appId: any) {
    this.jobsService.acceptOffer(id, appId).subscribe({
      next: (res: any) => {
        this.jobsService.jobs$
          .pipe(
            tap((jobs) => {
              const job: JobPost =
                jobs.find((job) => job._id == this.jobId) || {};
              job.applictions = [];
              this.applicants = [];
            })
          )
          .subscribe();
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }
  declineOffer(id: any, appId: any, i: number) {
    this.jobsService.declineOffer(id, appId).subscribe({
      next: (res: any) => {
        this.applicants.splice(i, 1);
        this.jobsService.jobs$
          .pipe(
            tap((jobs) => {
              const job: JobPost =
                jobs.find((job) => job._id == this.jobId) || {};
              const application =
                job.applictions?.find((el: any) => el._id == appId) || {};
              job.applictions?.splice(job.applictions.indexOf(application), 1);
            })
          )
          .subscribe();
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }
}
