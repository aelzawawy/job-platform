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

  effect(event: any) {
    if (event.target.value != '') {
      event.target.classList.add('active');
    } else {
      event.target.classList.remove('active');
    }
  }

  showPass(event:any){
    const passInput = document.querySelector('#password') as HTMLFormElement;
    if(event.target.getAttribute('clicked') == 'false'){
      event.target.setAttribute('clicked', 'true');
      passInput.setAttribute('type', 'text');
      event.target.textContent = 'Hide';
    } else{
      event.target.setAttribute('clicked', 'false');
      passInput.setAttribute('type', 'password');
      event.target.textContent = 'Show';
    }
  }
  ngOnInit(): void {}
}
