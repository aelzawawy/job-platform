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
  public config = {
    placeholder: 'Job description',
  }
  profilePic(user:any):boolean{
    if(!user.image){
      return true
    }
    return false
  }

  updatePost(id:any, index:number) {
    this.router.navigate(['/jobs-form'], {queryParams: {update_post: id}})
    this.jobsService.toUpdate = this.posts[index]
  }

  delJob(id:any, i:number){
    this.jobsService.delJOb(id).subscribe({
      next:()=> {
        this.posts.splice(i, 1);
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

  applictions = []

  // Get job applicants
  applicants(applications:any, jobId:any){
    this.jobsService.getJobInfo(jobId, applications);
    this.applictions = applications.map((el:any) => el.applicant);
    this.jobsService.getApplications(this.applictions);

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
  jobPosts() {
    if(localStorage['role'] == 'employer'){
      this.jobsService.getPosts().subscribe({
        next: (res: any) => {
          this.posts = res.reverse();
          if(this.posts.length != 0) this.job = this.posts[0]
        }
      });
    }
  }

  // Details function
  index = 0
  showDetails(e:any, i: number) {
    if(!e) return;
    const card = (e.target as HTMLElement).closest('.card')
    if(card != e.target) return;
    if (!this.ismobile) {
      this.job = this.posts[i]
    } else {
      this.router.navigate([`/job/${this.posts[i]._id}`]);
      this.jobsService.passJob(this.posts[i])
    }
    this.job = this.posts[i]
  }

  // Input Fields animations
  effect(event: any) {
    if (event.target.value != '') {
      event.target.classList.add('active');
    } else {
      event.target.classList.remove('active');
    }
  }
  ngOnInit(): void {
    this.isHandset$.subscribe((state) => {
      this.ismobile = state;
      setTimeout(() => {
        if(!this.ismobile){
          this.showDetails(null,0)
        }
      }, 100);
    });
    this.jobPosts();
  }
}