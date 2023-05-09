import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { JobsService } from 'src/app/services/jobs.service';
import { User } from 'src/app/interfaces/user';
import { JobPost } from 'src/app/interfaces/job-post';
import {MatDialog} from '@angular/material/dialog';
import { JobApplicationsComponent } from 'src/app/job-applications/job-applications.component';
import { Router, ActivatedRoute} from '@angular/router';
import { Observable } from 'rxjs';
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
    private observer: ObserverService,
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }
  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  posts: JobPost[] = [];
  user:User = {};
  job: JobPost = {};
  ismobile: boolean = false;
  loading: boolean = false;
  loadingPost: boolean = false;
  public config = {
    placeholder: 'Job description',
  }

  updatePost(id:any, index:number) {
    this.router.navigate(['/jobs-form'], {queryParams: {update_post: id}})
    this.jobsService.toUpdate = this.posts[index]
  }

  delJob(id:any, i:number){
    this.jobsService.delJOb(id).subscribe({
      next:()=> {
        this.posts.splice(i, 1);
        this.job = this.posts[0];
      },
      error(err:any){
        console.log(err);
      }
    })
  }

  // Salary formatting
  currencyFormat = (value: any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Get job applicants
  applicants(applications:any, jobId:any, index:any){
    this.jobsService.passJob(this.posts[index])
    const dialog = this.dialog.open(JobApplicationsComponent, {
      width: '400px',
      height: '500px'
    })
    dialog.afterClosed().subscribe(result => {
    });

  }

  // Date formatting
  formatDate = function (date: any) {
    const calcPassedDays = (now: any, postDate: any) =>
      Math.round(Math.abs(postDate - now) / (1000 * 60 * 60 * 24));
    const PassedDays = calcPassedDays(new Date(), date);

    if (PassedDays === 0) return `Today ${new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)}`;

    if (PassedDays === 1) return `Yesterday ${new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)}`;
    
   return `${PassedDays} days ago`;
  };

  // Display posts
  // jobPosts() {
  //   this.loading = true
  //   this.jobsService.getPosts().subscribe({
  //     next: (res: any) => {
  //       this.posts = res.reverse();
  //       if(this.posts.length != 0 && !this.ismobile) this.job = this.posts[0]
  //       this.loading = false
  //     }
  //   });
  // }

  // Details function
  index = 0
  showDetails(e:any, id: any, i: number) {
    if(!e) return;
    const card = (e.target as HTMLElement).closest('.card')
    if(card != e.target) return;
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
    this.loading = true
    this.jobsService.getPosts().subscribe({
      next: async(res: any) => {
        this.posts = await res.reverse();
        if(this.posts.length != 0 && !this.ismobile) this.job = this.posts[0]
        this.loading = false
      }
    });
    this.isHandset$.subscribe((state) => {
      this.ismobile = state;
      
      if(!this.ismobile){
        this.showDetails(null,null,0)
      }
      
    });
  }
}