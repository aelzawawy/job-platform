import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import { JobsService } from 'src/app/services/jobs.service';
import { JobPost } from 'src/app/interfaces/job-post';
import { MatSnackBar, MatSnackBarRef, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit, OnChanges  {

  constructor(private jobsService: JobsService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    
  }

  posts: JobPost[] = [];
  @Input() job:JobPost = {}

  ngOnChanges(changes: SimpleChanges) {
    // if (changes['job']) {
    //*    The ngOnChanges() hook is a good choice for this, since it is called whenever an @Input property changes.
    // }
  }
  
  @Output() unSave = new EventEmitter<string>()
  durationInSeconds = 5;
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
 
  applyJob(id:any){
    this.jobsService.applyJob(id).subscribe({
      next: (res:any) => {
        setTimeout(() => {
          this._snackBar.open(`${res.message}`, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.durationInSeconds * 500,
          });
        }, 800);
      },
      error: (e:any) => {
        setTimeout(() => {
          this._snackBar.open(`${e.error.Error}`, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.durationInSeconds * 500,
          });
        }, 800);
      }
    })
  }
  
  saveJob(id:any){
    if(!this.job.checkSaved){
      this.jobsService.saveJob(id).subscribe({
        next: (res:any) => {
          setTimeout(() => {
            this._snackBar.open(`${res.message}`, '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: this.durationInSeconds * 500,
            });
          }, 800);
        },
        error: (e:any) => {
          console.log(e);
          setTimeout(() => {
            this._snackBar.open(`${e.error.Error}`, '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: this.durationInSeconds * 500,
            });
          }, 800);
        }
      })
      setTimeout(() => {
        this.job.checkSaved = !this.job.checkSaved;
      }, 800);
    }else{
      this.jobsService.unSaveJob(id).subscribe({
        next: (res:any) => {
          setTimeout(() => {
            this._snackBar.open(`${res.message}`, '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: this.durationInSeconds * 500,
            });
            this.unSave.emit(id);
          }, 800);
        },
        error: (e:any) => {
          setTimeout(() => {
            this._snackBar.open(`${e.error.Error}`, '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: this.durationInSeconds * 500,
            });
          }, 800);
        }
      })
      setTimeout(() => {
        this.job.checkSaved = !this.job.checkSaved;
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
