import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { JobsService } from 'src/app/services/jobs.service';
import { User } from 'src/app/interfaces/user';
import { JobPost } from 'src/app/interfaces/job-post';
import {MatDialog} from '@angular/material/dialog';
import { JobApplicationsComponent } from 'src/app/job-applications/job-applications.component';
import { Router, ActivatedRoute} from '@angular/router';
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
  ) {}

  posts: JobPost[] = [];
  user:User = {};
  details = ''
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
        this.details = '';
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
        }
      });
    }
  }

  // Details function
  index = 0
  showDetails(e: any, i: number) {
    this.index = i;
    const remote = this.posts[i].remote? '<p><span class="detail-row--item">Remote</span> YAY, you can work from home🎉.</p>': ''
    const details = `
    <div class="card">
          <div class="card-head">
            <div class="card-head--left">
              <h5 class="title">${this.posts[i].title}</h5>
              <p>${this.posts[i].company}</p>
              <p>${this.posts[i].location}</p>
            </div>
          </div>
          <div class="card-body">
          <h5 class="title">Job details</h5>
          <div class="detail-row">
            <p><span class="detail-row--item">Salary</span> ${this.currencyFormat(this.posts[i].salary)}</p>
            <p><span class="detail-row--item">Job Type</span> ${this.posts[i].type}</p>${remote}
          </div>
          <div class="description">${this.posts[i].description}</div>
        </div>
    </div>
    `;
    this.details = details;
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
    this.jobPosts();
  }
}