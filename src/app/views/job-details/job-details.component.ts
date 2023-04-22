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
import { json } from 'express';
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
    private route: ActivatedRoute,
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }
 
  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  ngOnInit(): void {
    this.route.paramMap.subscribe((params)=>{
      if(params.get('id')){
        this.isHandset$.subscribe((state) => {
          this.ismobile = state;
          setTimeout(() => {
            if(!this.ismobile && params.get('id')){
              this.router.navigate([`/`]);
            }
          }, 0);
        });
        this.jobsService.getPassedJob().subscribe(async (res) => {
          if(Object.keys(res).length == 0) this.router.navigate([`/`]);
          await this.checkSaved(res._id)
          this.job = res 
        })
      }
    })
  }
  isSaved!:boolean
  ismobile!:boolean
  myId = localStorage['id']
  @Input() job: JobPost = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['job'] && localStorage['token']) {
    //*    The ngOnChanges() hook is a good choice for this, since it is called whenever an @Input property changes.
    this.checkSaved(this.job._id)
    }
  }

  async checkSaved(id:any){
    if (this.loggedIn()){
      this.jobsService.checkSaved(id).subscribe({
        next: (res: any) => {
          this.isSaved = res;
        },
        error: (e: any) => {
          console.log(e);
        },
      });
    }
  }
  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
  }
  @Output() unSave = new EventEmitter<string>();
  durationInSeconds = 5;
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  applyJob(id: any) {
    this.jobsService.applyJob(id).subscribe({
      next: (res: any) => {
        setTimeout(() => {
          this._snackBar.open(`${res.message}`, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.durationInSeconds * 500,
          });
        }, 800);
      },
      error: (e: any) => {
        setTimeout(() => {
          this._snackBar.open(`${e.error.Error}`, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.durationInSeconds * 500,
          });
        }, 800);
      },
    });
  }

  saveJob(id: any) {
    if (!this.isSaved) {
      this.jobsService.saveJob(id).subscribe({
        next: (res: any) => {
          setTimeout(() => {
            this._snackBar.open(`${res.message}`, '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: this.durationInSeconds * 500,
            });
          }, 800);
        },
        error: (e: any) => {
          console.log(e);
          setTimeout(() => {
            this._snackBar.open(`${e.error.Error}`, '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: this.durationInSeconds * 500,
            });
          }, 800);
        },
      });
      setTimeout(() => {
        this.isSaved = !this.isSaved;
      }, 800);
    } else {
      this.jobsService.unSaveJob(id).subscribe({
        next: (res: any) => {
          setTimeout(() => {
            this._snackBar.open(`${res.message}`, '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: this.durationInSeconds * 500,
            });
            this.unSave.emit(id);
          }, 800);
        },
        error: (e: any) => {
          setTimeout(() => {
            this._snackBar.open(`${e.error.Error}`, '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: this.durationInSeconds * 500,
            });
          }, 800);
        },
      });
      setTimeout(() => {
        this.isSaved = !this.isSaved;
      }, 800);
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
