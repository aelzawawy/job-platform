import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { JobsService } from '../services/jobs.service';
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  constructor(
    private userService: UserService,
    private jobsService: JobsService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}
  durationInSeconds = 5;
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  announcer = inject(LiveAnnouncer);
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  addOnBlur = true;
  myRole = '';
  public Editor = ClassicEditor;
  public config = {
    placeholder:
      this.myRole === 'user'
        ? `Tell us about you...`
        : `Tell us about your company...`,
  };

  // emailFormControl = new FormControl('', [Validators.email]);
  body: User = {
    name: '',
    location: {
      address: '',
      coordinates: [0],
    },
    company_name: '',
    company_website: '',
    email: '',
    phone: '',
    headline: '',
    industry: '',
    skills: [''],
    about: '',
  };

  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.body.skills?.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  close() {
    // this.closeEdit.emit();
    // this.jobsService.closeApplicants$.next(true);
    this.router.navigateByUrl(`/profile`);
  }

  remove(skill: any, index: number) {
    if (index >= 0) {
      this.body.skills?.splice(index, 1);
      this.announcer.announce(`Removed ${skill}`);
    }
  }

  save() {
    this.userService.editProfile(this.body).subscribe({
      next: (res: any) => {
        this._snackBar.open('Saved successfully ✅', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: this.durationInSeconds * 500,
        });
        localStorage.setItem('user', JSON.stringify(res));
        this.userService.passNewBody(this.body);
        this.router.navigateByUrl(`/profile`);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  ngOnInit(): void {
    const user = JSON.parse(localStorage['user'] || '[]');
    this.myRole = user.roles;
    this.body = {
      name: user.name,
      email: user.email,
      location: {
        address: user.location.address,
      },
      company_name: user.company?.name,
      company_website: user.company?.website_link,
      headline: user.headline,
      industry: user.industry,
      about: user.about || '',
      skills: user.skills,
      phone: user.phone,
    };
  }
}
