import { Component, OnInit, AfterContentInit } from '@angular/core';
import { JobsService } from 'src/app/services/jobs.service';
import { JobPost } from 'src/app/interfaces/job-post';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-saved-jobs',
  templateUrl: './saved-jobs.component.html',
  styleUrls: ['./saved-jobs.component.scss'],
})
export class SavedJobsComponent implements OnInit {
  constructor(
    private jobsService: JobsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.profile().subscribe({
      next: (res: any) => {
        this.posts = res.savedJobs.reverse();
        this.job = this.posts[0];
        if (this.posts.length != 0) this.job.checkSaved = true;
      },
      error: (e: any) => {
        console.log(e);
      },
    });
    setTimeout(async () => {
      await this.updateJobPosts();
    }, 50);
  }

  posts = new Array();
  job: JobPost = {};
  jobPosts!: NodeListOf<HTMLElement>;

  // updateJobPosts() {
  //   this.jobPosts = document.querySelectorAll('.card');
  //   if (this.jobPosts.length > 0) {
  //     this.jobPosts[0].classList.add('selected');
  //   }
  // }

  async updateJobPosts() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.jobPosts = document.querySelectorAll('.card');
        if (this.jobPosts.length > 0) {
          this.jobPosts[0].classList.add('selected');
        }
        resolve();
      }, 0);
    });
  }
  
  async unSave(id: string) {
    const index = this.posts.indexOf(this.posts.find((el) => el._id == id));
    if (index != -1) {
      this.posts.splice(index, 1);
      this.job = this.posts[0];
      this.job.checkSaved = true;
      await this.updateJobPosts();
    }
  }

  // Details function
  showDetails(e: any, id: any, i: number) {
    const current = e.target.closest('.card');
    this.jobPosts.forEach((post) => post.classList.remove('selected'));
    current.classList.add('selected');
    this.job = this.posts[i];
    this.job.checkSaved = true;
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
