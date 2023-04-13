import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  newPass = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(10)]],
  });
  passError:boolean = false;
  passErrorMsg = '';
  successMsg = ''
  success:boolean = false;
  setPass(data: any) {
    if(this.newPass.status == 'INVALID') return;
    this.route.params.subscribe(params => {
      if(params['token']){
        this.userService.resetPassword(params['token'], data.password).subscribe({
          next: (res: any) => {
            this.successMsg = res.message
            this.success = true
            setTimeout(() => {
              this.router.navigateByUrl(`/login`);
            }, 500);
          },
          error: (err: any) => {
            this.passError = true
            this.passErrorMsg = err.error
          },
        });
      }
    })
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
}
