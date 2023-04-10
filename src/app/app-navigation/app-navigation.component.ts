import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fader, slider } from '../route-animations';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-app-navigation',
  templateUrl: './app-navigation.component.html',
  styleUrls: ['./app-navigation.component.scss'],
  animations: [
    fader,
    // slider
  ],
})
export class AppNavigationComponent implements OnInit {
  constructor(
    private breakpointObserver: BreakpointObserver,
    private userService: UserService
  ) {}
  users: User[] = [];
  user: User = {};
  role?: string;

  ngOnInit(): void {
    if (this.loggedIn()) {
      this.userService.profile().subscribe({
        next: (res: any) => {
          this.user = res;
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    }
    this.userService.getRole().subscribe((role) => {
      this.role = role || localStorage['role'];
    });
  }

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(
      map((result) => result.matches),
      shareReplay()
  );

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }

  logOut() {
    localStorage.removeItem('token');
    this.loggedIn();
  }
  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
  }
}
