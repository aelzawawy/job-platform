import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10)]],
    confirm_password: ['', [Validators.required]],
  });

  missingName: boolean = false;
  invalidLogin = false;
  invalidEmail = false;
  invalidPass = false;
  invalidPasswordConfirm = false;

  passMsg = '';
  nameMsg = '';
  passwordConfirm = '';
  emailMsg = '';
  loading: boolean = false;
  signup(data: any) {
    if (this.signupForm.status == 'INVALID') return;
    this.loading = true;
    this.authService.signUP(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
        localStorage.setItem('id', res.user._id);
        localStorage.setItem('role', res.user.roles);
        this.userService.emitSignal(true);
        this.loading = false;
        this.router.navigateByUrl('/');
      },
      error: (err: any) => {
        this.loading = false;
        console.log(err);
        if (err.error.errors?.email) {
          this.invalidEmail = true;
          this.emailMsg = 'Enter your email';
        }
        if (Boolean(err.error.errors?.name)) {
          this.missingName = true;
          this.nameMsg = 'Enter your name';
        } else if (err.error.errors?.password) {
          this.invalidPass = true;
          this.passMsg = err.error.errors.password.message;
        } else if (
          this.signupForm.value.confirm_password == '' &&
          !err.error.errors?.password
        ) {
          this.invalidPasswordConfirm = true;
          this.passwordConfirm = 'Enter your password again!';
        } else if (
          err.error.errors?.confirm_password &&
          this.signupForm.value.confirm_password != ''
        ) {
          this.invalidPasswordConfirm = true;
          this.passwordConfirm = err.error.errors?.confirm_password.message;
        } else {
          this.invalidPass = false;
          this.invalidEmail = false;
        }
      },
    });
  }

  show_pass: boolean = false;
  pass_state = '<span class="material-icons">visibility</span>';
  pass_type = 'password';
  showPass(event: any) {
    this.show_pass = !this.show_pass;
    if (this.show_pass == true) {
      this.pass_type = 'text';
      this.pass_state = '<span class="material-icons">visibility_off</span>';
    } else {
      this.pass_type = 'password';
      this.pass_state = '<span class="material-icons">visibility</span>';
    }
  }

  routePath = this.route.snapshot.url[0].path;
  ngOnInit(): void {
    if (localStorage['token'] && this.routePath == 'signup') {
      this.router.navigateByUrl('/');
    }
  }
}
