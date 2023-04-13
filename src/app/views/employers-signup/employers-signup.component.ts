import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-employers-signup',
  templateUrl: './employers-signup.component.html',
  styleUrls: ['./employers-signup.component.scss']
})
export class EmployersSignupComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10)]],
    roles: ['employer', [Validators.required]],
  });
  invalidLogin = false;
  invalidEmail = false;
  invalidPass = false;

  passMsg = '';
  emailMsg = '';
  show_Pass = false;
  pass_type = 'password';
  pass_state = '<span class="material-symbols-outlined">visibility</span>'
  signup(data: any) {
    this.authService.signUP(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('profile');
        console.log(res);
      },
      error: (err: any) => {
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
