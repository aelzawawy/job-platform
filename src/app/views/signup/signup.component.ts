import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10)]],
  });
  invalidLogin = false;
  invalidEmail = false;
  invalidPass = false;

  passMsg = '';
  emailMsg = '';
  signup(data: any) {
    this.authService.signUP(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('profile');
        console.log(res);
      },
      error: (err: any) => {
        console.log(err);
        if (err.error.code) {
          this.invalidEmail = true;
          this.emailMsg = err.error.errors.email.message;
        } else if (err.error.errors?.password) {
          this.invalidPass = true;
          this.passMsg = err.error.errors.password.message;
        } else {
          this.invalidPass = false;
          this.invalidEmail = false;
        }
      },
    });
  }

  show_pass:boolean = false
  pass_state = '<span class="material-symbols-outlined">visibility</span>'
  pass_type = 'password'
  showPass(event:any){
    this.show_pass = !this.show_pass;
    if(this.show_pass == true){
      this.pass_type = 'text';
      this.pass_state = '<span class="material-symbols-outlined">visibility_off</span>';
    }else{
      this.pass_type = 'password';
      this.pass_state = '<span class="material-symbols-outlined">visibility</span>';
    }
  }

  
  routePath = this.route.snapshot.url[0].path
  ngOnInit(): void {
    if (localStorage['token'] && this.routePath == 'signup') {
      this.router.navigateByUrl('/');
    }
  }
}
