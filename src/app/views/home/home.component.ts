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
import { Observable } from 'rxjs';
import { ApiJob } from 'src/app/interfaces/api-job';
import { JobPost } from 'src/app/interfaces/job-post';
import { JobsService } from 'src/app/services/jobs.service';
import { ObserverService } from 'src/app/services/observer.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  constructor(
    private observer: ObserverService,
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }
  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  @ViewChildren('lastElement', { read: ElementRef })
  lastElement!: QueryList<ElementRef>;
  observeIntersection: any;
  posts: JobPost[] = [];
  apiPosts: ApiJob[] = [];
  job: JobPost = {};

  checkSaved: boolean = false;
  loading: boolean = false;
  job_Posts!: NodeListOf<HTMLElement>;

  search_Warning: boolean = false;
  totalPages!: number;
  pages!: number[];
  ismobile: boolean = false;

  search = {
    search_terms: '',
    location: '',
    radius: undefined,
    unit: '',
  };
  queryBody = {
    page: 1,
    limit: 10,
    order: -1,
  };
  loadingSvg:boolean = false
  ngOnInit(): void {
    this.isHandset$.subscribe((state) => {
      this.ismobile = state;
      setTimeout(() => {
        if(!this.ismobile && this.posts.length !=0){
          this.showDetails(this.posts[0]._id, 0)
        }
        this.loadingSvg = true;
      }, 200);
    });
    this.route.params.subscribe((params) => {
      if (params['id'] && params['token']) {
        this.userService.verify(params['id'], params['token']).subscribe({
          next: (res: any) => {
            alert(`${res.message}`);
            // this.state = res.message
          },
          error: (e: any) => {
            alert(`${e.error.message}`);
          },
        });
      }
    });
    this.jobPosts();
    this.observeIntersection = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && this.queryBody.page <= this.totalPages) {
            this.queryBody.page++;
            this.jobPosts();
          }
          if (!this.observe) this.observeIntersection.unobserve(e.target);
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
      if (list.last && this.posts.length >= this.queryBody.limit)
        this.observeIntersection.observe(list.last.nativeElement);
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

  // Search api
  jobSearch() {
    if (this.search.search_terms == '' && this.search.location == '') {
      this.search_Warning = true;
      return;
    }
    this.router.navigate(['/jobs'], {
      queryParams: {
        q: this.search.search_terms.trim(),
        i: this.search.location.trim(),
        radius: this.search.radius,
        unit: this.search.unit,
      },
    });
    // this.jobsService.searchApi(this.search).subscribe({
    //   next: async (res: any) => {
    //     if (res.length == 0) {
    //       this.loading = false;
    //       return;
    //     }else{
    //       this.job = res[0];
    //       this.isSaved(res[0]._id);
    //       this.posts = res;
    //     }

    //     // this.loading = false;
    //     // localStorage.setItem('apiRes', JSON.stringify(res));
    //   },
    //   error: (e: any) => {
    //     console.log(e);
    //   },
    // });
  }
  observe: boolean = true;
  // Display posts
  jobPosts() {
    this.loading = true;
    this.jobsService.getJobs(this.queryBody).subscribe({
      next: (res: any) => {
        if (res.posts.length < this.queryBody.limit) this.observe = false;
        if (res.posts.length == 0) {
          this.loading = false;
          return;
        }
        if (this.queryBody.page == 1 && !this.ismobile) {
          this.showDetails(res.posts[0]._id, 0);
        }
        this.posts = this.posts.concat(res.posts);
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }

  index: number = 0;
  // Details function
  showDetails(id: any, i: number) {
    this.jobsService.jobById(id).subscribe({
      next: (res: any) => {
        if (!this.ismobile) {
          this.job = res;
          this.index = i;
        } else {
          this.router.navigate([`/job/${id}`]);
          this.jobsService.passJob(res)
        }
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
