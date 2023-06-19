import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Observable, filter, skip } from 'rxjs';
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
  messaging: boolean = false;
  notifications: boolean = false;
  home: boolean = false;
  msgBadge: number = 0;
  notiBadge: number = 0;
  msgBadgeHidden = this.msgBadge == 0;
  notiBadgeHidden = this.notiBadge == 0;
  active: Boolean = false;
  searchInput: string = '';
  search: {
    search_terms: string;
    location?: string;
    category?: string;
  } = { search_terms: '' };
  passedValue = '';
  searchResults: User[] = [];
  searchOptions: string[] = [];
  filteredOptions: string[] = [];
  openDialog = false;
  delayedClose = true;
  searching = true;

  ngOnInit(): void {
    // document.addEventListener('click', (e) => {
    //   console.log(e.target);
    // });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.active = event.url.includes('/profile');
        this.user = JSON.parse(localStorage['user'] || '[]');
        this.messaging = event.url.includes('/messaging');
        this.notifications = event.url.includes('/notifications');
        this.home = event.url == '/';

        // this.closeFilters();
        this.close_dialog(true);
      }
    });

    this.userService.unread_notifications$
      .pipe(filter((res) => res != undefined))
      .subscribe((num) => {
        this.notiBadgeHidden = num == 0;
        this.notiBadge = num;
      });

    this.userService.unread_msgs$
      .pipe(filter((res) => res != undefined))
      .subscribe((num) => {
        this.msgBadgeHidden = num == 0;
        this.msgBadge = num;
      });

    this.userService.users$
      .pipe(filter((res) => Object.keys(res[0]).length != 0))
      .subscribe((res) => {
        res.map((user) => {
          this.searchOptions = Array.from(
            new Set([
              ...this.searchOptions,
              ...(user.skills || []),
              user.name || '',
            ])
          );
        });
      });
  }

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }

  close_dialog(close: boolean) {
    // Wait for the animation to end
    this.openDialog = false;
    setTimeout(() => {
      this.delayedClose = true;
    }, 400);
  }

  close_dialog_click_outside(e: any) {
    if (e.target.closest('.chipList')) return;
    if (!e.target.closest('.slider-scroll')) {
      this.close_dialog(true);
    }
  }
  searchUsers(input: any) {
    if (typeof input === 'string') this.search.search_terms = input;
    this.passedValue = this.search.search_terms;
    this.searching = true;
    if (Boolean(this.search.search_terms)) {
      this.delayedClose = false;
      this.openDialog = true;
      this.userService.searchUsers(this.search).subscribe({
        next: (res: any) => {
          this.searchResults = res;
          this.searching = false;
          this.search.search_terms = '';
          this.filteredOptions = [];
        },
        error: (e) => {
          console.log(e);
        },
      });
    }
  }

  inputControl(e: any) {
    if (e.type == 'click' || e.which == 27) {
      this.search.search_terms = '';
      e.target.blur();
    }
    // Filter options on keyUp
    this.filteredOptions = this.searchOptions
      .filter(
        (el) =>
          el.startsWith(this.search.search_terms) ||
          el.includes(this.search.search_terms)
      )
      .sort(this.compareOptions);
    if (this.search.search_terms == '') this.filteredOptions = [];
  }

  compareOptions = (a: string, b: string) => {
    // if both options start with the input, compare them alphabetically
    if (
      a.startsWith(this.search.search_terms) &&
      b.startsWith(this.search.search_terms)
    ) {
      return a.localeCompare(b);
    }
    // if only one option starts with the input, put it first
    if (a.startsWith(this.search.search_terms)) {
      return -1;
    }
    if (b.startsWith(this.search.search_terms)) {
      return 1;
    }
    // otherwise, compare them alphabetically
    return a.localeCompare(b);
  };

  logOut() {
    this.userService.removeToken().subscribe();
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
