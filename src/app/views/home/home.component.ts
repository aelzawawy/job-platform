import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiJob } from 'src/app/interfaces/api-job';
import { JobPost } from 'src/app/interfaces/job-post';
import { JobsService } from 'src/app/services/jobs.service';
// import { last } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  constructor(
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  @ViewChildren('lastElement', { read: ElementRef })
  lastElement!: QueryList<ElementRef>;
  observer:any;
  posts: JobPost[] = [];
  apiPosts: ApiJob[] = [];
  job: JobPost = {};

  checkSaved: boolean = false;
  loading: boolean = false;
  job_Posts!: NodeListOf<HTMLElement>;

  search_Warning: boolean = false;
  totalPages!: number;
  pages!: number[];

  search = {
    search_terms: '',
    location: '',
  };
  queryBody = {
    page: 1,
    limit: 10,
    order: -1,
  };

  ngOnInit(): void {
    this.jobPosts();
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (this.queryBody.page <= this.totalPages) {
              this.jobPosts();
              this.queryBody.page++;
            }
          }
        });
      },
      {
        threshold: 1,
      }
    );

    // console.log(JSON.parse(localStorage['apiRes'] || '[]'));
  }

  ngAfterViewInit(): void {
    this.lastElement.changes.subscribe((list) => {
      if(list.last) this.observer.observe(list.last.nativeElement);
    });
  }

  async pageUp(page: any) {
    this.queryBody.page = page;
    this.jobPosts();
  }

  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
  }

  isSaved(id: any) {
    this.jobsService.checkSaved(id).subscribe({
      next: (res: any) => {
        this.job.checkSaved = res;
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }

  // Search api
  jobSearch() {
    if (this.search.search_terms == '' && this.search.location == '') {
      this.search_Warning = true;
      return;
    }
    this.router.navigate(['/jobs'], {
      queryParams: { q: this.search.search_terms, i: this.search.location },
    });
    this.jobsService.searchApi(this.search).subscribe({
      next: async (res: any) => {
        if (res.length == 0) {
          this.loading = false;
          return;
        }else{
          this.job = res[0];
          this.isSaved(res[0]._id);
          this.posts = res;
        }

        // this.loading = false;
        // localStorage.setItem('apiRes', JSON.stringify(res));
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }

  // Display posts
  jobPosts() {
    this.loading = true;
    setTimeout(() => {
      this.jobsService.getJobs(this.queryBody).subscribe({
        next: (res: any) => {
          if(this.queryBody.page == 1) this.job = res.posts[0]
          if (this.loggedIn() && this.queryBody.page == 1) {
            this.isSaved(res.posts[0]._id);
          }
          this.posts = this.posts.concat(res.posts);
          this.totalPages = res.totalPages;
          this.loading = false;
        },
        error: (e: any) => {
          console.log(e);
        },
      });
    }, 500);
  }

  getJob(id: any) {
    this.jobsService.jobById(id).subscribe({
      next: (res: any) => {
        this.job = res;
      },
    });
    if (this.loggedIn()) {
      this.isSaved(id);
    }
  }
  index: number = 0;
  // Details function
  showDetails(id: any, i: number) {
    this.getJob(id);
    this.index = i;
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
