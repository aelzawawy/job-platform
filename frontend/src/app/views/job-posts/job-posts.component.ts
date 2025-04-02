import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, skip, take } from 'rxjs';
import { JobPost } from 'src/app/interfaces/job-post';
import { User } from 'src/app/interfaces/user';
import { JobApplicationsComponent } from 'src/app/job-applications/job-applications.component';
import { JobsService } from 'src/app/services/jobs.service';
import { ObserverService } from 'src/app/services/observer.service';
@Component({
  selector: 'app-job-posts',
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobPostsComponent implements OnInit {
  constructor(
    private jobsService: JobsService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private observer: ObserverService
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }
  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  posts: JobPost[] = [];
  user: User = {};
  job: JobPost = {};
  ismobile: boolean = false;
  loading: boolean = false;
  loadingPost: boolean = false;
  showApplocations: boolean = false;
  delayedClose: boolean = true;
  public config = {
    placeholder: 'Job description',
  };

  closeApplications() {
    this.showApplocations = false;
    setTimeout(() => {
      this.delayedClose = true;
    }, 400);
    this.dialog.closeAll();
  }
  close_click_outside(e: any) {
    if (!e.target.closest('.applications_slider')) {
      this.closeApplications();
    }
  }

  updatePost(id: any, index: number) {
    this.router.navigate(['/jobs-form'], { queryParams: { update_post: id } });
    this.jobsService.toUpdate = this.posts[index];
  }

  delJob(id: any, i: number) {
    this.jobsService.delJOb(id).subscribe({
      next: () => {
        this.posts.splice(i, 1);
        this.job = this.posts[0];
      },
      error(err: any) {
        console.log(err);
      },
    });
  }

  // Salary formatting
  currencyFormat = (value: any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Get job applicants
  applicants(jobId: any) {
    if (jobId) this.jobsService.jobId$.next(jobId);
    if (this.ismobile) {
      this.showApplocations = true;
      this.delayedClose = false;
    } else {
      this.openDialog();
    }
  }
  openDialog() {
    this.dialog.closeAll();
    const dialog = this.dialog.open(JobApplicationsComponent, {
      width: '450px',
      height: '500px',
    });
    dialog.afterClosed().subscribe((result) => {
      this.jobsService.showApplicants$.next(false);
    });
  }

  // Date formatting
  formatDate = function (date: any) {
    const calcPassedDays = (now: any, postDate: any) =>
      Math.round(Math.abs(postDate - now) / (1000 * 60 * 60 * 24));
    const PassedDays = calcPassedDays(new Date(), date);

    if (PassedDays === 0)
      return `Today ${new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)}`;

    if (PassedDays === 1)
      return `Yesterday ${new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)}`;

    return `${PassedDays} days ago`;
  };

  // Details function
  index = 0;
  showDetails(e: any, id: any, i: number) {
    if (!e) return;
    const card = (e.target as HTMLElement).closest('.card');
    if (card != e.target) return;
    this.index = i;
    if (!this.ismobile) {
      this.loadingPost = true;
      this.job = this.posts[i];
      this.loadingPost = false;
    } else if (this.ismobile) {
      this.jobsService.passJob(this.posts[i]);
      this.router.navigate([`/job/${id}`]);
      this.loadingPost = false;
    }
  }

  ngOnInit(): void {
    this.isHandset$.subscribe((state) => {
      this.ismobile = state;
      if (!this.ismobile) {
        this.showDetails(null, null, 0);
      }
    });
    this.jobsService.jobs$
      .pipe(filter((res) => Object.keys(res[0] || []).length != 0))
      .subscribe((res) => {
        this.posts = res;
        this.job = this.posts[0];
        console.log(this.posts)
      });
    this.jobsService.loadingMyPosts$.subscribe((res) => {
      this.loading = this.loadingPost = res;
    });
    this.jobsService.showApplicants$
      .pipe(
        filter((res) => res != false),
        take(1)
      )
      .subscribe((res) => {
        this.jobsService.jobId$.subscribe((id) => {
          const currIndex = this.posts.findIndex((el) => el._id == id);
          this.index = currIndex;
          this.job = this.posts[currIndex];
        });
        if (this.ismobile) {
          this.showApplocations = true;
          this.delayedClose = false;
        } else {
          this.openDialog();
        }
      });
    this.jobsService.closeApplicants$.next(false);
    this.jobsService.closeApplicants$.subscribe((res) => {
      if (res) {
        this.closeApplications();
      }
    });
  }
}
