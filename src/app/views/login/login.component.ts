import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10)]],
  });

  invalidLogin = false;
  login(data: any) {
    this.authService.login(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('profile');
      },
      error: (err: any) => {
        if (err) this.invalidLogin = true;
        console.log(err);
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

  showPass(event: any) {
    const passInput = document.querySelector('#password') as HTMLFormElement;
    if (event.target.getAttribute('clicked') == 'false') {
      event.target.setAttribute('clicked', 'true');
      passInput.setAttribute('type', 'text');
      event.target.textContent = 'Hide';
    } else {
      event.target.setAttribute('clicked', 'false');
      passInput.setAttribute('type', 'password');
      event.target.textContent = 'Show';
    }
  }

  // routePath = this.route.snapshot.url[0].path;
  // state = this.router.routerState;
  ngOnInit(): void {
    // if (localStorage['token'] && this.routePath == 'login') {
    //   this.router.navigateByUrl('/');
    // }
  }
}
