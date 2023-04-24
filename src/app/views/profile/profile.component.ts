import { Component,inject, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router, ActivatedRoute} from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { FormBuilder, FormControl } from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import { EditProfileComponent } from 'src/app/edit-profile/edit-profile.component';
import { Observable } from 'rxjs';
import { ObserverService } from 'src/app/services/observer.service';
// import {Subscription} from 'rxjs';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private observer: ObserverService,
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }
  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  // routeQueryParams$: Subscription;
  users: User[] = [];
  user: User = {};
  profileImg: any;
  backgoroundImg: any;
  resume: any;
  expanded:boolean = true;
  toView:boolean = true;
  loading:boolean = false;
    
  profile() {
    this.loading = true;
    this.userService.profile().subscribe({
      next: (res: any) => {
        this.user = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
    // if(localStorage['id'] === this.user_toView_id) {
    // }else{
    //   this.userService.profileById(this.user_toView_id).subscribe({
    //     next: (res: any) => {
    //       this.user = res;
    //       this.loading = false;
    //     },
    //     error: (err: any) => {
    //       console.log(err);
    //     },
    //   });
    // }
    
  }

  uploadImg(e: any) {
    const imageOut = document.querySelectorAll('.profile-pic') as NodeListOf<HTMLImageElement>;
    this.profileImg = e.target.files[0];
    const myImg = new FormData();
    myImg.append('image', this.profileImg);
    this.userService.profileImage(myImg).subscribe({});
    imageOut.forEach(el => el.src = URL.createObjectURL(this.profileImg))
  }

  uploadBgImg(e: any) {
    const imageOut = document.getElementById(
      'backgoround-pic'
    ) as HTMLImageElement;
    this.backgoroundImg = e.target.files[0];
    const myBgImg = new FormData();
    myBgImg.append('backgoroundImage', this.backgoroundImg);
    this.userService.backgoroundImage(myBgImg).subscribe({});
    imageOut.src = URL.createObjectURL(this.backgoroundImg);
  }

  uploadResume(e:any){
    this.resume = e.target.files[0];
    const myResume = new FormData();
    myResume.append('resume', this.resume);

    this.userService.resume(myResume).subscribe({
      next: (res:any) => {
        // console.log(res.message);
      }, error: (e:any) => {
        console.log(e);
      }
    })
    const uploadBtn = document.querySelector('#uploadResume') as HTMLLabelElement;
    uploadBtn.classList.toggle('success')
  }

  delBg(){
    const bgOut = document.getElementById(
      'backgoround-pic'
    ) as HTMLImageElement;
    this.userService.removeBg().subscribe({});
    bgOut.src = '../../../assets/bg.jpg';
  }

  openDialog(){
    const dialog = this.dialog.open(update_profile_image, {
      width: '220px',
      height: '115px',
    })
    // dialog.afterClosed().subscribe(result => {
    //   // this.router.navigateByUrl('/profile')
    // });
  }

  openEdit(){
    this.router.navigate([`/profile`], {queryParams: {edit: true}})
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      // this.toView = localStorage['id'] == params['id']
      if(params['id']){
        this.toView = false
        this.loading = true;
        this.userService.profileById(params['id']).subscribe({
          next: (res: any) => {
            this.user = res;
            this.loading = false;
          },
          error: (err: any) => {
            console.log(err);
          },
        });
      }else{
        this.toView = true
        this.profile();
      }
    })
    this.userService.updatedProfile().subscribe((body) => {
      if(body == '') return;
      this.user.name = body.name;
      this.user.location!.address = body.location.address;
      this.user.headline = body.headline;
      this.user.email = body.email;
    })
    this.route.queryParamMap.subscribe((param) => {
      if ((param.get('edit') == 'true')) {
        const dialogRef = this.dialog.open(EditProfileComponent, {
          width: '100%',
          height: '80%',
        });
        dialogRef.afterClosed().subscribe(result => {
          this.router.navigateByUrl(`/profile`)
        });
      }
      
    })
  }
}


@Component({
  selector: 'update_profile_image-component',
  template: `
    <div class="wrapper">
      <label for="upload" id="uploadImg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16"
              fill="currentColor" class="mercado-match" width="40" height="40" focusable="false">
              <title>Update pofile image</title>
              <path
                  d="M10 9a2 2 0 11-2-2 2 2 0 012 2zm5-2.5V14H1V6.5A2.5 2.5 0 013.5 4h.75L5 2h6l.75 2h.75A2.5 2.5 0 0115 6.5zM11 9a3 3 0 10-3 3 3 3 0 003-3z">
              </path>
          </svg>
      </label>
      <span>|</span>
      <button mat-menu-item (click)="this.delImg()">
        <svg width="50px" height="50px" fill="currentColor" version="1.1" viewBox="-1.9 -1.9 22.8 22.8" xmlns="http://www.w3.org/2000/svg">
        <title>delete pofile image</title>
        <desc>Created with Sketch.</desc>
        <g fill="none" fill-rule="evenodd" style="--darkreader-inline-stroke:none" data-darkreader-inline-stroke="">
        <path d="m4.9167 14.889c0 0.46825 0.6875 1.1111 1.1458 1.1111h6.875c0.45833 0 1.1458-0.64286 1.1458-1.1111v-8.8889h-9.1667v8.8889zm10.083-11.424h-2.4444l-1.2222-1.465h-3.6667l-1.2222 1.465h-2.4444v1.465h11v-1.465z" fill="currentColor" ></path>
        </g></svg>
      </button>
    </div>
  `,
  styles: [
    `
      .wrapper{
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
      
      #uploadImg {
        padding: 10px;
        border: 2px solid black;
        border-radius: 50px;
        background-color: white;
        color: black;
        cursor: pointer;
      }
      #uploadImg:hover{
          background-color: black;
          color: white;
        }
      button {
        padding: 5px;
        border-radius: 50px;
        background-color: white;
        color: black;
      }
      button:hover{
          background-color: black;
          color: white;
        }
    `,
  ],
})
export class update_profile_image {
  
  constructor(private userService: UserService,){}
  delImg(){
    const imageOut = document.querySelectorAll('.profile-pic') as NodeListOf<HTMLImageElement>;
    this.userService.removeProfileImage().subscribe({});
    imageOut.forEach(el => el.src = '../../../assets/34AD2.png')
  }
}