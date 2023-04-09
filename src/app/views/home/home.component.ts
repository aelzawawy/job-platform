import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { JobsService } from 'src/app/services/jobs.service';
import { Router, ActivatedRoute } from '@angular/router';
import { JobPost } from 'src/app/interfaces/job-post';
import { ApiJob } from 'src/app/interfaces/api-job';
import * as e from 'express';
// import { last } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}


  posts: JobPost[] = [];
  apiPosts: ApiJob[] = [];
  job: JobPost = {};

  checkSaved: boolean = false;
  loading: boolean = false;
  job_Posts!: NodeListOf<HTMLElement>;
  
  searching:boolean = false;
  search_Warning:boolean = false;
  totalPages!:number;
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
  
    setTimeout(() => {
      // const jobPosts = document.querySelector('.content__posts') as HTMLElement;
      // const jobDetails = document.querySelector('.content__details') as HTMLElement;
      // const observer = new IntersectionObserver((entries) => {

      //   entries.forEach((e) =>{
      //     jobDetails.classList.toggle("sticky-position", !e.isIntersecting);
      //   })
      // },
      // {
      //   threshold:0,
      // });
      // observer.observe(tabBtns)

    }, 500);

    setTimeout(async () => {
      await this.updateJobPosts();
    }, 200);

    // this.route.queryParamMap.subscribe((param) => {
    //   if(param.get('search')){
    //     this.searching = true;
    //   }else{
    //     this.searching = false;
    //     this.router.navigate(['/'])
    //   }
    // })

    // console.log(JSON.parse(localStorage['apiRes'] || '[]'));
  }

  // observe(){
  //   // const tabBtns = document.querySelector('.mat-tab-labels') as HTMLElement;
  //   setTimeout(() => {
  //     // const jobDetails = document.querySelector('.content__details') as HTMLElement;
  //     // const observer = new IntersectionObserver((entries) => {
  //     //   entries.forEach((e) =>{
  //     //     jobDetails.classList.toggle("sticky-position", !e.isIntersecting)
  //     //   })
  //     // },
  //     // {
  //     //   threshold:0,
  //     // });
  //     // observer.observe(tabBtns)
  //   }, 500);
  //   const jobPost = document.querySelectorAll('.card');
  //   jobPost[0]?.classList.add('selected');
  // }

  async pageUp(page:any){
    this.queryBody.page = page;
    this.jobPosts();
    setTimeout(async () => {
      await this.updateJobPosts();
    }, 50);
  }
  
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

  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
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

  // Search api
  jobSearch() {
    if(this.search.search_terms == '' && this.search.location == ''){
      this.search_Warning = true;
      return;
    }
    this.router.navigate(['/jobs'], {queryParams: {q: this.search.search_terms, i: this.search.location}})
    this.jobsService.searchApi(this.search).subscribe({
      next: async (res: any) => {
        if(res.length == 0){
          this.loading = false;
          this.searching = false;
          return;
        }
        
        // this.apiPosts = res;
        // this.response = res;
        this.posts = res;
        this.loading = false;
        this.job = res[0]
        this.isSaved(res[0]._id);
        await this.updateJobPosts();
        // localStorage.setItem('apiRes', JSON.stringify(res));
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }

  // Display posts
  jobPosts() {
    this.jobsService.getJobs(this.queryBody).subscribe({
      next: (res: any) => {
        // if(this.posts.length == 0){
        //   this.posts = res.posts
        // }else{
        // }
        this.posts = res.posts
        // this.posts = this.posts.concat(res.posts)
        this.totalPages = res.totalPages;
        this.pages = Array(this.totalPages).fill(0).map((x,i)=>i+1)
        this.job = res.posts[0];
        if (this.loggedIn()) {
          this.isSaved(res.posts[0]._id);
        }
      },
      error: (e:any) =>{
        console.log(e)
      }
    });
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
  // // post options menu
  // openMenu(e: any) {
  //   const menus = document.querySelectorAll('.card--options-menu');
  //   const btns = document.querySelectorAll('.card--options-toggle');
  //   btns.forEach((btn) => btn.classList.remove('showMenu'));
  //   menus.forEach((menu) => menu.classList.remove('show'));
  //   btns.forEach((btn) => {
  //     const currMenu = btn.nextSibling as HTMLElement;
  //     if (e.target == btn) {
  //       if (btn.getAttribute('aria-expanded') == 'false') {
  //         btn.classList.add('showMenu');
  //         currMenu.classList.add('show');
  //         btn.setAttribute('aria-expanded', 'true');
  //       } else {
  //         btn.classList.remove('showMenu');
  //         currMenu.classList.remove('show');
  //         btn.setAttribute('aria-expanded', 'false');
  //       }
  //     }
  //   });
  // }

  // // Save function
  // saveJob(e: any, id: any) {}

  // Details function
  showDetails(e: any, id: any, i: number) {
    const posts = document.querySelectorAll('.card');
    const current = e.target.closest('.card');

    posts.forEach((post) => post.classList.remove('selected'));
    current.classList.add('selected');

    this.getJob(id);
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
