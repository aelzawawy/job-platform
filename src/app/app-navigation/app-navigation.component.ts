import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { ObserverService } from 'src/app/services/observer.service';
import { UserService } from 'src/app/services/user.service';
import { fader } from '../route-animations';
@Component({
  selector: 'app-app-navigation',
  templateUrl: './app-navigation.component.html',
  styleUrls: ['./app-navigation.component.scss'],
  animations: [fader],
})
export class AppNavigationComponent implements OnInit {
  constructor(
    private observer: ObserverService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }
  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  user: User = {};
  role?: string;
  loading: boolean = false;
  expanded: boolean = false;
  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.active = event.url.includes('/profile');
        this.user = JSON.parse(localStorage['user'] || '[]');
      }
    });
  }
  active: Boolean = false;
  
  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }

  logOut() {
    this.userService.removeToken().subscribe()
    localStorage.clear();
    this.router.navigateByUrl(`/`);
    this.loggedIn();
  }
  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
  }
}
