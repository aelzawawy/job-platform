import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { JobsService } from 'src/app/services/jobs.service';
import { UserService } from 'src/app/services/user.service';
// import { User } from 'src/app/interfaces/user';
import { JobPost } from 'src/app/interfaces/job-post';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-job-posts-form',
  templateUrl: './job-posts-form.component.html',
  styleUrls: ['./job-posts-form.component.scss'],
})
export class JobPostsFormComponent implements OnInit {
  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  posts: JobPost[] = [];
  // user:User = {};
  public Editor = ClassicEditor;
  public config = {
    placeholder: `Compose a satisfying job description...`,
  };
  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: any) => {
      if (Boolean(params.get('update_post'))) {
        this.edit = Boolean(params.get('update_post'));
        this.id = params.get('update_post');
        const body = this.jobsService.toUpdate;
        if (Object.keys(body).length == 0)
          this.router.navigateByUrl('/jobPosts');
        this.formControl.patchValue({
          title: `${body.title}`,
          description: `${body.description}`,
          location: `${body.location?.address}`,
          salary: `${body.salary || 0}`,
          company: `${body.company}`,
          remote: body.remote,
          type: `${body.type}`,
        });
      }
    });
  }

  formControl = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    location: ['', [Validators.required]],
    salary: [''],
    company: ['', [Validators.required]],
    type: ['', [Validators.required]],
    remote: [false],
  });

  checkTouched(e: any) {
    this.blue_underline =
      Boolean(e.target.closest('.field')) &&
      !this.formControl.controls.description.touched &&
      Boolean(this.formControl.value.description == '');
    this.orange_underline =
      !Boolean(e.target.closest('.field')) &&
      this.formControl.controls.description.touched &&
      Boolean(this.formControl.value.description == '');
    this.success_value =
      !Boolean(e.target.closest('.field')) && this.valid_value;
  }
  checkValid(e: any) {
    this.invalid_value =
      !Boolean(e) && this.formControl.controls.description.touched;
    this.valid_value =
      Boolean(e) && this.formControl.controls.description.touched;
  }

  invalid_value: boolean = false;
  valid_value: boolean = false;
  success_value: boolean = false;
  blue_underline: boolean = false;
  blue_again_underline: boolean = false;
  orange_underline: boolean = false;
  edit: boolean = false;
  id!: string;

  newPost(body: any) {
    if (this.formControl.status == 'VALID') {
      if (this.edit) {
        this.jobsService.updateJOb(this.id, body).subscribe({
          next: (res: any) => {
            this.router.navigateByUrl('/jobPosts');
          },
          error: (err: any) => {
            console.log(err);
          },
        });
      } else {
        this.jobsService.postJob(body).subscribe({
          next: (res: any) => {
            this.posts.unshift(res);
            this.router.navigateByUrl('/jobPosts');
          },
          error: (err: any) => {
            console.log(err);
          },
        });
      }
    }
    this.invalid_value = Boolean(this.formControl.value.description == '');
  }
}
