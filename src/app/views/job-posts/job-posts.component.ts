import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { JobsService } from 'src/app/services/jobs.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { JobPost } from 'src/app/interfaces/job-post';
import {MatDialog} from '@angular/material/dialog';
import { JobApplicationsComponent } from 'src/app/job-applications/job-applications.component';
@Component({
  selector: 'app-job-posts',
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobPostsComponent implements OnInit {
  constructor(
    private userService:UserService,
    private fb: FormBuilder,
    private jobsService: JobsService,
    public dialog: MatDialog,
  ) {}

  posts: JobPost[] = [];
  user:User = {};
  // State variables
  checked = false
  postId = ''
  postIndex = ''
  edit = false

  profilePic(user:any):boolean{
    if(!user.image){
      return true
    }
    return false
  }

  postJob = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    location: ['', [Validators.required]],
    salary: ['', [Validators.required]],
    company: ['', [Validators.required]],
    type: ['', [Validators.required]],
    remote: [false],
  });

  showForm(e:any, id:any, i:any) {
    const form = document.querySelector('#form') as HTMLFormElement;
    const posts = document.querySelector('.content__posts') as HTMLFormElement;
    const formcontrols = document.querySelectorAll('.control');

    const title = document.querySelector('#title') as HTMLInputElement
    const description = document.querySelector('#description') as HTMLInputElement
    const location = document.querySelector('#location') as HTMLInputElement
    const salary = document.querySelector('#salary') as HTMLInputElement
    const company = document.querySelector('#company') as HTMLInputElement
  
    this.postId = id
    this.postIndex = i

    // To edit post instead of adding new
    if(e.target.classList.contains('update')){
      this.edit = true
      window.scroll({top: 0});

      this.postJob.patchValue({
        title: `${this.posts[i].title}`,
        description: `${this.posts[i].description}`,
        location: `${this.posts[i].location}`,
        salary: `${this.posts[i].salary || 0}`,
        company: `${this.posts[i].company}`,
        remote: this.posts[i].remote,
        type: `${this.posts[i].type}`,
      })

      title.classList.add('active');
      location.classList.add('active');
      salary.classList.add('active');
      company.classList.add('active');
      description.classList.add('active');
      
    }else{this.edit = false}

    // Form toggle actions
    if(e.target.classList.contains('btn-success') && !form.classList.contains('hidden')){
      formcontrols.forEach( btn => {
        if(btn.classList.contains('btn-danger'))
        btn.classList.add('btn-success');
        btn.classList.remove('btn-danger');;
      })
      e.target.classList.remove('btn-success');
      e.target.classList.add('btn-danger');
    
    }else if(e.target.classList.contains('btn-success')){
      form.classList.toggle('hidden');
      posts?.classList.add('slide-down');
      e.target.classList.remove('btn-success');
      e.target.classList.add('btn-danger');
    
    }else{
      form.classList.toggle('hidden');
      posts?.classList.remove('slide-down');
      e.target.classList.add('btn-success');
      e.target.classList.remove('btn-danger');
    }
  }

  // Post & Update function
  postJobs(body: any, id:any, e:any) {
    const posts = document.querySelector('.content__posts') as HTMLFormElement;
    const formcontrols = document.querySelectorAll('.control');
    formcontrols.forEach( btn => {
      if(btn.classList.contains('btn-danger'))
      btn.classList.add('btn-success');
      btn.classList.remove('btn-danger')
    })
    e.target.classList.toggle('hidden');
    posts?.classList.toggle('slide-down');
    if(this.edit == false){
      this.jobsService.postJob(body).subscribe({
        next: (res: any) => {
          this.posts.unshift(res);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    }else{
      this.jobsService.updateJOb(id, body).subscribe({
        next: (res:any)=> {
          this.jobPosts();
          console.log(res);
        },
        error: (err: any) => {
          console.log(err);
        },
      })
    }
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
    
    if (PassedDays <= 7) return `${PassedDays} days ago`;
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric', 
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  };

  // Display posts
  jobPosts() {
    this.jobsService.getPosts().subscribe({
      next: (res: any) => {
        this.posts = res;
      }
    });
  }

  // Details function
  showDetails(e: any, i: number) {
    if(e.target.closest('.abs-pos') || e.target.closest('.card--options-toggle')) return;
    const posts = document.querySelectorAll(".card");
    const current = e.target.closest('.card');
    const detailCard = document.querySelector('.content__details') as HTMLElement;
    detailCard.innerHTML = '';
    posts.forEach(post => post.classList.remove('selected'))
    current.classList.add('selected');
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
          <h5 class="title">Full Job Description</h5>
          <p class="description">${this.posts[i].description}</p>
        </div>
    </div>
    `;
    detailCard.insertAdjacentHTML("beforeend", details);
  }

  // Close form on outside click 
  formClose(e:any){
    const form = document.querySelector('#form') as HTMLFormElement;
    if(!e.target.closest('.form') && !form.classList.contains('hidden') && !e.target.classList.contains('control')){
      form.classList.toggle('hidden')
      const posts = document.querySelector('.content__posts') as HTMLFormElement;
      const formcontrols = document.querySelectorAll('.control') ;
      formcontrols.forEach( btn => {
        if(btn.classList.contains('btn-danger'))
        btn.classList.add('btn-success');
        btn.classList.remove('btn-danger');
      })
      posts?.classList.toggle('slide-down');
    }
    this.openMenu(e)
  }

  // Input Fields animations
  effect(event: any) {
    if (event.target.value != '') {
      event.target.classList.add('active');
    } else {
      event.target.classList.remove('active');
    }
  }

  openMenu(e:any){
    const menus = document.querySelectorAll('.card--options-menu')
    const btns = document.querySelectorAll(".card--options-toggle");
    btns.forEach(btn => btn.classList.remove('showMenu'))
    menus.forEach(menu => menu.classList.remove('show'))
    btns.forEach(btn => {
      const currMenu = btn.nextSibling as HTMLElement
      if(e.target == btn){
        if(btn.getAttribute('aria-expanded') == 'false' ){
          btn.classList.add('showMenu');
          currMenu.classList.add('show');
          btn.setAttribute('aria-expanded', 'true')
        }else{
          btn.classList.remove('showMenu');
          currMenu.classList.remove('show');
          btn.setAttribute('aria-expanded', 'false')
        }
      }
    })
  }

  ngOnInit(): void {
    this.jobPosts();
  }
}