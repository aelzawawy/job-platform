import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { JobPost } from 'src/app/interfaces/job-post';
import { JobsService } from 'src/app/services/jobs.service';
import { ObserverService } from 'src/app/services/observer.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss'],
})
export class JobDetailsComponent implements OnInit, OnChanges {
  constructor(
    private jobsService: JobsService,
    private _snackBar: MatSnackBar,
    private observer: ObserverService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }

  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      if (params.get('id')) {
        this.loading = true;
        this.jobsService.getPassedJob().subscribe(async (res) => {
          this.job =
            Object.keys(res).length != 0
              ? res
              : JSON.parse(localStorage['openedPost'] || '[]');
          if (localStorage['token']) this.checkSaved(res._id);
          this.loading = false;
        });
        this.isHandset$.subscribe((state) => {
          this.ismobile = state;
          setTimeout(() => {
            if (!this.ismobile && params.get('id')) {
              this.new_window = true;
            }
          }, 0);
        });
      }
    });
  }
  isSaved!: boolean;
  loading: boolean = false;
  new_window: boolean = false;
  ismobile!: boolean;
  myId = localStorage['id'];
  @Input() job: JobPost = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['job'] && localStorage['token']) {
      //* The ngOnChanges() hook is a good choice for this, since it is called whenever an @Input property changes.
      if (localStorage['token']) this.checkSaved(this.job._id);
    }
  }

  async checkSaved(id: any) {
    const savedJobs = JSON.parse(localStorage['savedJobs'] || '[]');
    this.isSaved = savedJobs.some((el: any) => el._id == id);
  }
  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
  }

  @Output() unSave = new EventEmitter<string>();
  @Output() doSave = new EventEmitter<JobPost>();

  durationInSeconds = 5;
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  applyJob(id: any) {
    this.jobsService.applyJob(id).subscribe({
      next: (res: any) => {
        this._snackBar.open(`${res.message}`, '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: this.durationInSeconds * 500,
        });
      },
      error: (e: any) => {
        this._snackBar.open(`${e.error.Error}`, '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: this.durationInSeconds * 500,
        });
      },
    });
  }

  saveJob(id: any) {
    if (!this.isSaved) {
      this.jobsService.saveJob(id).subscribe({
        next: (res: any) => {
          this._snackBar.open(`${res.message}`, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.durationInSeconds * 500,
          });
          this.doSave.emit(res.job);
        },
        error: (e: any) => {
          console.log(e);
          this._snackBar.open(`${e.error.Error}`, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.durationInSeconds * 500,
          });
        },
      });
      setTimeout(() => {
        this.isSaved = !this.isSaved;
      }, 800);
    } else {
      this.jobsService.unSaveJob(id).subscribe({
        next: (res: any) => {
          this._snackBar.open(`${res.message}`, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.durationInSeconds * 500,
          });
          this.unSave.emit(id);
        },
        error: (e: any) => {
          this._snackBar.open(`${e.error.Error}`, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.durationInSeconds * 500,
          });
        },
      });
      this.isSaved = !this.isSaved;
    }
  }

  // Salary formatting
  currencyFormat = (value: any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
}
