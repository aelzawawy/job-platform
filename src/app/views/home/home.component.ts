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
// import { Router, ActivatedRoute } from '@angular/router';
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
  ) {}
  posts: JobPost[] = [];
  apiPosts: ApiJob[] = [];
  job: JobPost = {};
  checkSaved: boolean = false;
  response:string = '';
  loading:boolean = false;
  search = {
    search_terms:'',
    location:'' 
  }
  ngOnInit(): void {
    // const tabBtns = document.querySelector('.mat-tab-labels') as HTMLElement;
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
      const jobPost = document.querySelectorAll('.card');
      jobPost[0]?.classList.add('selected');
    }, 500);
    this.jobPosts();
    // this.jobSearch()
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
  

  // Search api
  jobSearch(){
    console.log(this.search);
    // this.jobsService.searchApi(this.search).subscribe({
    //   next: (res:any) =>{
    //     // this.apiPosts = res;
    //     // this.response = res;
    //     console.log(res);
    //   },error: (e:any) => {
    //     console.log(e);
    //   }
    // })
  }

  // Display posts
  jobPosts() {
    this.jobsService.getJobs().subscribe({
      next: (res: any) => {
        this.posts = res;
        this.job = res[0];
        this.jobsService.checkSaved(res[0]._id).subscribe({
          next: (res:any) => {
            if(res){
              this.job.checkSaved = true;
            }else{
              this.job.checkSaved = false;
            }
          },
          error: (e:any) => {
            console.log(e);
          }
        })
      },
    });
  }

  getJob(id: any) {
    this.jobsService.jobById(id).subscribe({
      next: (res: any) => {
        this.job = res;
      },
    });
    this.jobsService.checkSaved(id).subscribe({
      next: (res:any) => {
        if(res){
          this.job.checkSaved = true;
        }else{
          this.job.checkSaved = false;
        }
      },
      error: (e:any) => {
        console.log(e);
      }
    })
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
    // this.jobsService.checkSaved(id).subscribe({
    //   next: (res:any) => {
    //     if(res){
    //       this.checkSaved = true;
    //     }else{
    //       this.checkSaved = false;
    //     }
    //   },
    //   error: (e:any) => {
    //     console.log(e);
    //   }
    // })

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
