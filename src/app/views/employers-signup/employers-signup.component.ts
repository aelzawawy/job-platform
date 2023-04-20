import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-employers-signup',
  templateUrl: './employers-signup.component.html',
  styleUrls: ['./employers-signup.component.scss']
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
  invalidLogin = false;
  invalidEmail = false;
  invalidPass = false;
  invalidPasswordConfirm = false;
  missingName:boolean = false;
  nameMsg = '';
  passMsg = '';
  passwordConfirm = '';
  emailMsg = '';
  show_Pass = false;
  pass_type = 'password';
  pass_state = '<span class="material-symbols-outlined">visibility</span>'
  pattern: RegExp = /(?<=Path).*/
  signup(data: any) {
    this.authService.signUP(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('id', res.user._id);
        localStorage.setItem('role', res.user.roles);
        this.userService.emitRole(res.user.roles);
        this.router.navigateByUrl('/');
      },
      error: (err: any) => {
        if (err.error.errors?.email) {
          this.invalidEmail = true;
          this.emailMsg = "Enter your email";
        }
        if (Boolean(err.error.errors?.name)) {
          this.missingName = true;
          this.nameMsg = "Enter your name";
        } else if (err.error.errors?.password) {
          this.invalidPass = true;
          this.passMsg = err.error.errors.password.message;
        }else if (this.signupForm.value.confirm_password == '' && !err.error.errors?.password) {
          this.invalidPasswordConfirm = true;
          this.passwordConfirm = 'Enter your password again!'
        }else if (err.error.errors?.confirm_password && this.signupForm.value.confirm_password != '') {
          this.invalidPasswordConfirm = true;
          this.passwordConfirm = err.error.errors?.confirm_password.message
        }else {
          this.invalidPass = false;
          this.invalidEmail = false;
        }
      },
    });
  }

  showPass(event:any){
    this.show_Pass = !this.show_Pass;
    if(this.show_Pass == true){
      this.pass_type = 'text';
      this.pass_state = '<span class="material-symbols-outlined">visibility_off</span>';
    }else{
      this.pass_type = 'password';
      this.pass_state = '<span class="material-symbols-outlined">visibility</span>';
    }
  }
  ngOnInit(): void {}
}
