import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-employers-signup',
  templateUrl: './employers-signup.component.html',
  styleUrls: ['./employers-signup.component.scss'],
})
export class EmployersSignupComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10)]],
    confirm_password: [''],
    roles: ['employer', [Validators.required]],
  });
  err = '';
  isErr = false;
  show_Pass = false;
  pass_type = 'password';
  pass_state = '<span class="material-icons">visibility</span>';
  pattern: RegExp = /(?<=Path).*/;
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
        this.isErr = true;
        this.err = err.error;
      },
    });
  }

  showPass(event: any) {
    this.show_Pass = !this.show_Pass;
    if (this.show_Pass == true) {
      this.pass_type = 'text';
      this.pass_state = '<span class="material-icons">visibility_off</span>';
    } else {
      this.pass_type = 'password';
      this.pass_state = '<span class="material-icons">visibility</span>';
    }
  }
  ngOnInit(): void {}
}
