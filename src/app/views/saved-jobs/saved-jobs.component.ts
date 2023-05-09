import { AfterContentInit, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { JobPost } from 'src/app/interfaces/job-post';
import { JobsService } from 'src/app/services/jobs.service';
import { ObserverService } from 'src/app/services/observer.service';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-saved-jobs',
  templateUrl: './saved-jobs.component.html',
  styleUrls: ['./saved-jobs.component.scss'],
})
export class SavedJobsComponent implements OnInit {
  constructor(
    private jobsService: JobsService,
    private userService: UserService,
    private observer: ObserverService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }
  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  ngOnInit(): void {
    this.isHandset$.subscribe((state) => {
      this.ismobile = state;
      // setTimeout(() => {
      //   if (!this.ismobile) {
      //     this.showDetails(this.posts[0]._id, 0);
      //   }
      // }, 100);
    });
    this.loading = true
    this.userService.profile().subscribe({
      next: (res: any) => {
        if(res.savedJobs.length == 0){
          this.loading = false
          return
        }
        this.posts = res.savedJobs.reverse();
        this.job = this.posts[0];
        this.job.saved = true
        this.loading = false
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }

  posts = new Array();
  job: JobPost = {};
  isSaved!: boolean;
  ismobile: boolean = false;
  loading: boolean = false;
  loadingPost: boolean = false;
  jobPosts!: NodeListOf<HTMLElement>;

  unSave(id: string) {
    const index = this.posts.indexOf(this.posts.find((el) => el._id == id));
    if (index != -1) {
      this.posts.splice(index, 1);
      this.job = this.posts[0];
      localStorage.setItem('savedJobs', JSON.stringify(this.posts));
      this.isSaved = true;
    }
  }

  // Details function
  index:number = 0;
  showDetails(id: any, i: number) {
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

  // Salary formatting
  currencyFormat = (value: any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

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
    // if (PassedDays <= 7) return `${PassedDays} days ago`;
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  };
}
