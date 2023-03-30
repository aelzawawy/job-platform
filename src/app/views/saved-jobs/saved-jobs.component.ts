import { Component, OnInit } from '@angular/core';
import { JobsService } from 'src/app/services/jobs.service';
import { JobPost } from 'src/app/interfaces/job-post';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-saved-jobs',
  templateUrl: './saved-jobs.component.html',
  styleUrls: ['./saved-jobs.component.scss']
})
export class SavedJobsComponent implements OnInit {
  constructor(
    private jobsService: JobsService,
    private userService: UserService,
  ) {}
  ngOnInit(): void {
    this.userService.profile().subscribe({
      next: (res:any) => {
        this.getJob(res.savedJobs[0])
        res.savedJobs.forEach((post:any) => {
          this.jobsService.jobById(post).subscribe({
            next: (res: any) => {
              this.posts.unshift(res);
            },
            error: (e:any) => {
              console.log(e);
            }
          });
        })
      },
      error: (e:any) => {
        console.log(e);
      }
    })

    setTimeout(() => {
      const jobPost = document.querySelectorAll('.card');
      jobPost[0]?.classList.add('selected');
    }, 500);
  }

  posts = new Array;
  job: JobPost = {};

  // Save function
  saveJob(e: any, id: any) {}

  getJob(id: any) {
    if(id == undefined) return
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
