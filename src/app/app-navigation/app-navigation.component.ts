import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fader, slider } from '../route-animations';
import { Observable } from 'rxjs';
import { ObserverService } from 'src/app/services/observer.service';
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
    private observer: ObserverService,
    private userService: UserService
  ) {
    this.isHandset$ = this.observer.isHandset$
  }
  isHandset$!: Observable<boolean>
  users: User[] = [];
  user: User = {};
  role?: string;
  loading:boolean = false;

  ngOnInit(): void {
    if (this.loggedIn()) {
      this.userService.profile().subscribe({
        next: (res: any) => {
          this.user = res;
          this.loading = true;
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
