import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
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

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss'],
})
export class UserSearchComponent implements OnInit, OnChanges, OnDestroy {
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
  search: {
    search_terms: string;
    location?: string;
    industry?: string;
    skills?: string;
  } = { search_terms: '' };

  searchOptions: string[] = [];
  filteredOptions: string[] = [];
  industries: string[] = [];
  skills: string[] = [];
  appliedFilters: { section: string; value: string }[] = [];
  index1 = -1;
  index2 = -1;
  openDialog = false;
  onlyEGP = false;
  open_filters = false;
  delayedClose = true;
  industryFilterString = '';
  skillFilterString = '';
  loader_posetion = 'relative';
  @Input() users: User[] = [];
  @Input() passedValue = '';
  @Input() loading = false;
  @Output() close_dialog = new EventEmitter<boolean>();

  ngOnDestroy() {
    this.users = [];
    this.passedValue = '';
  }

  ngOnInit(): void {
    this.users = [];
    this.userService.users$
      .pipe(filter((res) => Object.keys(res[0]).length != 0))
      .subscribe((res) => {
        res.map((user) => {
          this.skills = Array.from(
            new Set(this.skills.concat(user.skills || []))
          );
          this.industries = Array.from(
            new Set(this.industries.concat([`${user.industry}`]))
          );
          this.searchOptions = Array.from(
            new Set([
              ...this.searchOptions,
              ...this.skills,
              ...(user.headline?.split(' | ') || []),
              user.name || '',
              user.industry || '',
            ])
          );
        });
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['passedValue']) {
      this.search.search_terms = this.passedValue;
    }
  }

  closeDialog() {
    this.close_dialog.emit(true);
  }

  goToProfile(e: any, id: any) {
    this.closeDialog();
    this.router.navigate([`user/${id}`]);
  }

  isSelected(value: string): boolean {
    return this.appliedFilters.some((el) => el.value == value);
  }

  openFilters() {
    this.open_filters = true;
    this.delayedClose = false;
  }
  closeFilters() {
    this.open_filters = false;
    setTimeout(() => {
      this.delayedClose = true;
    }, 400);
  }
  close_click_outside(e: any) {
    if (e.target.closest('.chipList')) return;
    if (!e.target.closest('.filters_slider')) {
      this.closeFilters();
    }
  }
  setToEGYPT(e: any) {
    this.search.location = e.target.checked ? e.target.dataset.value : '';
    this.searchUsers(null);
  }

  resetFilters(value: string) {
    this.appliedFilters = this.appliedFilters.filter(
      (el) => el.section != value
    );
    // Clear query strings
    value === 'industry' && (this.industryFilterString = '');
    value === 'skills' && (this.skillFilterString = '');
    if (value === 'all') {
      this.appliedFilters = [];
      this.industryFilterString = '';
      this.skillFilterString = '';
    }
    // Update query
    this.update_search_query();
    this.searchUsers(null);
  }

  remFilter(filter: any, index: number) {
    this.appliedFilters.splice(index, 1);

    if (filter.section === 'industry') {
      this.industryFilterString = this.get_new_string(
        this.industryFilterString,
        filter.value
      );
    } else if (filter.section === 'skills') {
      this.skillFilterString = this.get_new_string(
        this.skillFilterString,
        filter.value
      );
    }

    this.update_search_query();
    this.searchUsers(null);
  }

  get_new_string(originalString: string, filter: string): string {
    const arr = originalString.split(' | ');
    const filtered = arr.filter((el) => el !== filter);
    const newString = filtered.join(' | ');
    return newString;
  }

  filter(e: any) {
    const filterSection = e.target.offsetParent.dataset.section;
    const filterValue = e.target.innerText;
    const isSet = this.appliedFilters.some(
      (skill) => skill.value === filterValue
    );
    if (isSet) return;

    // Set filter
    this.appliedFilters.push({ section: filterSection, value: filterValue });
    // Create query strings from applied filters
    this.create_query_strings(filterSection);
    // Update query
    this.update_search_query();
    this.searchUsers(null);
  }

  create_query_strings(filterSection: string) {
    filterSection === 'industry' &&
      (this.industryFilterString =
        this.get_applied_filters_string(filterSection));
    filterSection === 'skills' &&
      (this.skillFilterString = this.get_applied_filters_string(filterSection));
  }

  update_search_query() {
    this.search = {
      search_terms: this.passedValue,
      industry: this.industryFilterString,
      skills: this.skillFilterString,
      location: this.search.location,
    };
  }

  get_applied_filters_string(section: string): string {
    const string = this.appliedFilters
      .flatMap((filter) => {
        let arr: any = [];
        if (filter.section === section) {
          arr = [...arr, filter.value];
        }
        return arr;
      })
      .join(' | ');
    return string;
  }

  searchUsers(input: any) {
    if (typeof input === 'string') {
      this.search.search_terms = input;
    } else {
      this.search.search_terms = this.passedValue;
    }

    this.loading = true;
    if (Boolean(this.search.search_terms)) {
      this.userService.searchUsers(this.search).subscribe({
        next: (res: any) => {
          this.users = res;
          this.loading = false;
          this.passedValue = this.search.search_terms;
          this.search.search_terms = '';
          this.filteredOptions = [];
        },
        error: (e) => {
          console.log(e);
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
  }

  inputControl(e: any) {
    if (
      (e.type == 'click' && e.target.dataset.closes === 'userSearch') ||
      (e.which == 27 && e.target.name === 'userSearch')
    ) {
      this.passedValue = '';
    } else if (
      (e.type == 'click' && e.target.dataset.closes === 'location') ||
      (e.which == 27 && e.target.name === 'location')
    ) {
      this.search.location = '';
    }

    // Filter options on keyUp
    this.filteredOptions = this.searchOptions
      .filter(
        (el) => el.startsWith(this.passedValue) || el.includes(this.passedValue)
      )
      .sort(this.compareOptions);
    if (this.passedValue == '') this.filteredOptions = [];
  }

  compareOptions = (a: string, b: string) => {
    // if both options start with the input, compare them alphabetically
    if (a.startsWith(this.passedValue) && b.startsWith(this.passedValue)) {
      return a.localeCompare(b);
    }
    // if only one option starts with the input, put it first
    if (a.startsWith(this.passedValue)) {
      return -1;
    }
    if (b.startsWith(this.passedValue)) {
      return 1;
    }
    // otherwise, compare them alphabetically
    return a.localeCompare(b);
  };
}
