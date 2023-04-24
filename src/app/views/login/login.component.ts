import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10)]],
  });
  forgot = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  invalidLogin = false;
  wrongPassText = '';
  forgotPassword = false;
  loading:boolean = false
  login(data: any) {
    this.loading = true
    if(this.loginForm.status == 'INVALID') return;
    this.authService.login(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('id', res.user._id);
        localStorage.setItem('role', res.user.roles);
        this.userService.emitRole(res.user.roles);
        this.loading = false
        this.router.navigateByUrl(`/`);
      },
      error: (err: any) => {
        console.log(err)
        if (err) this.invalidLogin = true;
        this.wrongPassText = err.error;
        this.loading = false
      },
    });
  }
  forgotPass() {
    this.router.navigate(['/login'], { queryParams: {'forgot_password': 'true'}});
  }
  successMsg = ''
  success:boolean = false;
  resetPass(data:any) {
    if(this.forgot.status == 'INVALID') return;
    this.userService.forgotPassword(data.email).subscribe({
      next: (res: any) => {
        this.successMsg = res.message
        this.success = true
        setTimeout(() => {
          this.router.navigateByUrl(`/`);
        }, 500);
      },
      error: (e: any) => {
        console.log(e.error);
      },
    });
  }

  show_pass: boolean = false;
  pass_state = '<span class="material-symbols-outlined">visibility</span>';
  pass_type = 'password';
  showPass(event: any) {
    this.show_pass = !this.show_pass;
    if (this.show_pass == true) {
      this.pass_type = 'text';
      this.pass_state =
        '<span class="material-symbols-outlined">visibility_off</span>';
    } else {
      this.pass_type = 'password';
      this.pass_state =
        '<span class="material-symbols-outlined">visibility</span>';
    }
  }
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      if(params.get('forgot_password')){
        this.forgotPassword = true;
      }
    })
  }
}
