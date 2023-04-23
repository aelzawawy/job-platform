import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { JobPost } from 'src/app/interfaces/job-post';
import { JobsService } from 'src/app/services/jobs.service';
import { ObserverService } from 'src/app/services/observer.service';
@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnInit {
  constructor(
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute,
    private observer: ObserverService
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
    this.route.queryParams.subscribe((params) => {
      this.search = {
        search_terms: params['q'],
        location: params['i'],
        radius: params['radius'],
        unit: params['unit'],
        sort: params['sort'],
      };
      this.sortByDate = Boolean(params['sort']);
      if (this.search.search_terms == '' && this.search.location == '') {
        this.search_Warning = true;
        return;
      }

      this.search_Warning = false;
      this.loading = true;
      this.jobsService.searchApi(this.search).subscribe({
        next: async (res: any) => {
          if (res.length != 0) {
            this.posts = res;
            this.job = res[0];
            this.loading = false;
          } else {
            this.posts = [];
          }
        },
        error: (e: any) => {
          console.log(e);
        },
      });
    });
  }

  posts: JobPost[] = [];
  job: JobPost = {};
  job_Posts!: NodeListOf<HTMLElement>;
  search_Warning!: boolean;
  sortByDate: boolean = false;
  search = {
    search_terms: '',
    location: '',
    radius: 0,
    unit: '',
    sort: '',
  };
  ismobile: boolean = false;
  loading: boolean = false;
  loadingPost: boolean = false;
  sort(e: any) {
    this.router.navigate(['/jobs'], {
      queryParams: {
        q: this.search.search_terms,
        i: this.search.location,
        radius: this.search.radius,
        unit: this.search.unit,
        sort: 'date',
      },
    });
  }
  index = 0;
  showDetails(id: any, i: number) {
    this.index = i;
    this.loadingPost = true
    this.jobsService.jobById(id).subscribe({
      next: (res: any) => {
        if (!this.ismobile) {
          this.job = res;
          this.loadingPost = false
        } else {
          this.router.navigate([`/job/${id}`]);
          this.jobsService.passJob(res);
          this.loadingPost = false
        }
      },
    });
  }

  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
  }

  getJob(id: any) {
    this.jobsService.jobById(id).subscribe({
      next: (res: any) => {
        this.job = res;
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
}
