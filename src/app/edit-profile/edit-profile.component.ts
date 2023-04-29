import { Component, inject, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import {
  MatSnackBar,
  MatSnackBarRef,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  constructor(
    private userService: UserService,
    private _snackBar: MatSnackBar
  ) {}
  public Editor = ClassicEditor;
  public config = {
    placeholder: `Format your profile`,
  };

  // emailFormControl = new FormControl('', [Validators.email]);
  body: User = {
    name: '',
    location: {
      address: '',
      coordinates: [0],
    },
    email: '',
    phone: '',
    headline: '',
    about: "<h2>remove extra lines before saving!</h2><h2>who you are?</h2><p>…………………………………..</p><p>…………………………………..</p><h2>skills:</h2><ul><li>…………………………….</li><li>…………………………….</li><li>…………………………….</li></ul><h2>work experience:</h2><p>…………………………………..</p><p>………………………………….</p>",
  };
  durationInSeconds = 5;
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  save() {
    this.userService.editProfile(this.body).subscribe({
      next: (res: any) => {
        this._snackBar.open('Saved successfully ✅', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: this.durationInSeconds * 500,
        });
        this.userService.editProfileSocket(this.body);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  ngOnInit(): void {
    this.userService.profile().subscribe({
      next: (res: any) => {
        this.body.name = res.name;
        this.body.location!.address = res.location.address;
        this.body.email = res.email;
        this.body.phone = res.phone;
        this.body.headline = res.headline;
        this.body.about = res.about || this.body.about;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
}

// @Component({
//   selector: 'notification-component',
//   template: `
//     <span class="notification" matSnackBarLabel> Saved successfuly!</span>
//   `,
//   styles: [
//     `
//       :host {
//         display: flex;
//         justify-content: space-between;
//       }
//       .notification {
//         color: green;
//       }
//     `,
//   ],
// })
// export class successMsg {
//   snackBarRef = inject(MatSnackBarRef);
// }
