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

  loading: boolean = false;
  err = '';
  isErr = false;
  signup(data: any) {
    if (
      this.signupForm.status == 'INVALID' ||
      this.signupForm.value.confirm_password !== this.signupForm.value.password
    )
      return;
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
        this.isErr = true;
        this.err = err.error;
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
