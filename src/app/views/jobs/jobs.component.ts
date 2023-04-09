import { Component, OnInit } from '@angular/core';
import { JobsService } from 'src/app/services/jobs.service';
import { Router, ActivatedRoute } from '@angular/router';
import { JobPost } from 'src/app/interfaces/job-post';
@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit{
  constructor(
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute,
  ){}
  ngOnInit():void{
    this.route.queryParams.subscribe((params) => {
      this.search = {
        search_terms: params['q'],
        location: params['i'],
        sort: params['sort'],
      };
      this.sortByDate = Boolean(params['sort']);
      if(this.search.search_terms == '' && this.search.location == ''){
        this.search_Warning = true;
        return;
      }
  
      this.search_Warning = false;
      this.jobsService.searchApi(this.search).subscribe({
        next: async (res: any) => {
          this.posts = res;
          this.job = res[0]
          await this.updateJobPosts();
        },
        error: (e: any) => {
          console.log(e);
        },
      });
    })
  }

  posts: JobPost[] = [];
  job: JobPost = {};
  job_Posts!: NodeListOf<HTMLElement>;
  search_Warning!:boolean;
  sortByDate:boolean = false
  search = {
    search_terms: '',
    location: '',
    sort: '',
  };
  async updateJobPosts() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.job_Posts = document.querySelectorAll('.card');
        if (this.job_Posts.length > 0) {
          this.job_Posts[0].classList.add('selected');
        }
        resolve();
      }, 0);
    });
  }

  sort(e:any){
    this.router.navigate(['/jobs'], {queryParams: {q: this.search.search_terms, i: this.search.location, sort: 'date'}});
  }

  showDetails(e: any, id: any, i: number) {
    const posts = document.querySelectorAll('.card');
    const current = e.target.closest('.card');

    posts.forEach((post) => post.classList.remove('selected'));
    current.classList.add('selected');

    this.getJob(id);
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
    if (this.loggedIn()) {
      this.isSaved(id);
    }
  }

  isSaved(id:any){
    this.jobsService.checkSaved(id).subscribe({
      next: (res: any) => {
        this.job.checkSaved = res;
      },
      error: (e: any) => {
        console.log(e);
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
    // if (PassedDays <= 7) return `${PassedDays} days ago`;
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  };
}
