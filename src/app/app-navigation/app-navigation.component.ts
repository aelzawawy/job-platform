import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationError, NavigationStart, RouterOutlet } from '@angular/router';
import { fader, slider } from '../route-animations';
import { Observable } from 'rxjs';
import { ObserverService } from 'src/app/services/observer.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { ActivatedRoute, Router } from '@angular/router';
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
  expanded:boolean = false
  fadeUpClass:boolean = false
  ngOnInit(): void {
  //   this.router.events.subscribe((event) => {
  //     if (event instanceof NavigationStart) {
  //         // Show progress spinner or progress bar
  //         console.log(event.url.includes);
  //     }

  //     if (event instanceof NavigationEnd) {
  //         // Hide progress spinner or progress bar      
  //         console.log(event);
  //     }

  //     if (event instanceof NavigationError) {
  //         // Hide progress spinner or progress bar
  //         // Present error to user
  //         console.log(event.error);
  //     }
  // });
    this.loading = true;
    this.userService.getRole().subscribe((role) => {
      this.role = role || localStorage['role'];
      if (this.loggedIn()) {
        this.userService.profile().subscribe({
          next: (res: any) => {
            this.user = res;
            this.loading = false;
          },
          error: (err: any) => {
            console.log(err);
          },
        });
      }
    });
  }
  isScrolling(e:any){
    this.fadeUpClass = true
  }
  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }

  logOut() {
    localStorage.clear()
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
