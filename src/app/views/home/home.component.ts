import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiJob } from 'src/app/interfaces/api-job';
import { Location } from 'src/app/interfaces/geoJson';
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
  @ViewChild('map', { read: ElementRef })
  map!: ElementRef;
  observeIntersection: any;
  mapObserver: any;
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
    sort: '',
  };
  queryBody = {
    page: 1,
    limit: 7,
    order: -1,
  };
  loadingSvg: boolean = false;
  jobLocations: Location[] = [];
  flyToo!: [number, number];
  navBar!: HTMLElement;
  ngOnInit(): void {
    this.isHandset$.subscribe((state) => {
      this.ismobile = state;
      setTimeout(() => {
        this.loadingSvg = true;
        if (!this.ismobile) {
          this.job = this.posts[0];
        }
      }, 200);
    });
    this.route.params.subscribe((params: any) => {
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

    // this.mapObserver = new IntersectionObserver(
    //   (entries) => {
    //     entries.forEach((e) => {
    //       console.log(e.isIntersecting)
    //       this.navBar = document.querySelector('.mat-toolbar') as HTMLElement;
    //       this.navBar.classList.toggle('transparent', e.isIntersecting);
    //       if (e.isIntersecting) {
            
    //       }
    //     });
    //   },
    //   {
    //     threshold: 1,
    //   }
    // );

    if (localStorage['token']) {
      this.userService.getContacts().subscribe({
        next: (res: any) => {
          localStorage.setItem('contacts', JSON.stringify(res));
        },
        error: (err: any) => {
          console.log(err);
        },
      });

      this.userService.profile().subscribe({
        next: (res: any) => {
          localStorage.setItem('savedJobs', JSON.stringify(res.savedJobs.reverse()));
        },
        error: (e: any) => {
          console.log(e);
        },
      });
    }
  }

  ngAfterViewInit(): void {
    this.lastElement.changes.subscribe((list) => {
      if (list.last && this.posts.length >= this.queryBody.limit)
        this.observeIntersection.observe(list.last.nativeElement);
    });
    // this.mapObserver.observe(this.map.nativeElement);
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

  //! undo search
  undoSearch() {
    this.search.search_terms = '';
    this.search.location = '';
    this.posts = [];
    this.searching = false;
    this.observe = true;
    this.queryBody.page = 1;
    this.jobPosts();
  }

  //! Send locations to mapBox component
  passLocations() {
    this.jobLocations = this.posts.map((post) => {
      const location = {
        title: `${post.title}`,
        address: `${post.location?.address}`,
        coords: post.location?.coordinates,
      };
      return location;
    });
  }

  //todo Search functions
  sort(e: any) {
    if (this.search.sort == 'date') return;
    this.sortByDate = true;
    this.search.sort = 'date';
    this.jobSearch();
  }
  resetSort(e: any) {
    if (this.search.sort == '') return;
    this.sortByDate = false;
    this.search.sort = '';
    this.jobSearch();
  }
  sortByDate: boolean = false;
  searching: boolean = false;
  jobSearch() {
    if (this.search.search_terms == '' && this.search.location == '') {
      this.search_Warning = true;
      return;
    }
    this.jobsService.searchApi(this.search).subscribe({
      next: async (res: any) => {
        if (res.length == 0) {
          this.loading = false;
          return;
        } else {
          this.job = res[0];
          this.posts = res;
          this.searching = true;
          this.passLocations();
        }

        this.loading = false;
        // localStorage.setItem('apiRes', JSON.stringify(res));
      },
      error: (e: any) => {
        console.log(e);
      },
    });
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
        this.posts = this.posts.concat(res.posts);
        this.totalPages = res.totalPages;
        this.loading = false;
        this.passLocations();
        // this.mapObserver.observe(this.map.nativeElement);
        if (this.queryBody.page == 1 && !this.ismobile) {
          this.index = 0;
          this.job = res.posts[0];
        }
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }

  index!: number;
  loadingPost: boolean = false;
  // Details function
  showDetails(id: any, i: number) {
    this.index = i;
    if (!this.ismobile) {
      this.loadingPost = true;
      this.job = this.posts[i];
      this.loadingPost = false;
      this.flyToo = this.posts[i].location?.coordinates || [0, 0];
    } else if (this.ismobile) {
      this.jobsService.passJob(this.posts[i]);
      this.router.navigate([`/job/${id}`]);
      localStorage.setItem('openedPost', JSON.stringify(this.posts[i]));
      this.loadingPost = false;
    }
  }

  unSave(id: string) {
    const savedJobs = JSON.parse(localStorage['savedJobs'] || '[]')
    const index = savedJobs.indexOf(savedJobs.find((el:any) => el._id == id));
    if (index != -1) {
      savedJobs.splice(index, 1);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    }
  }
  doSave(job:JobPost){
    const savedJobs = JSON.parse(localStorage['savedJobs'] || '[]')
    savedJobs.push(job);
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
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
