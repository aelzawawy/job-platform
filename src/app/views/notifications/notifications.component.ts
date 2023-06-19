import { Component, OnInit } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Observable, filter, tap } from 'rxjs';
import { Notification } from 'src/app/interfaces/notification';
import { JobsService } from 'src/app/services/jobs.service';
import { ObserverService } from 'src/app/services/observer.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  constructor(
    private observer: ObserverService,
    private userService: UserService,
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }
  ngOnInit(): void {
    this.userService.notifications$.subscribe(
      (res) => (this.notifications = res)
    );
  }

  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  notifications: Notification[] = [];
  durationInSeconds = 1;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  delNotification(id: string, i: number) {
    this.notifications.splice(i, 1);
    if (this.notifications.length == 0)
      this.userService.unread_notifications$.next(0);
    this.userService.deleteNotification(id).subscribe({
      next: (res: any) => {
        this._snackBar.open(`${res.message}`, '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: this.durationInSeconds * 1000,
        });
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }
  read_notification(
    e: any,
    i: number,
    id: string,
    path: string,
    jobId: string
  ) {
    const item = e.target.closest('.notifications-list--item');
    const options = e.target.closest('.options');
    if (!options) {
      item.classList.remove('unread');
      this.userService.notifications$
        .pipe(tap((list) => (list[i].read = true)))
        .subscribe((res) => {
          const unread = res.filter((el: any) => !el.read).length;
          this.userService.unread_notifications$.next(unread);
        });
      this.userService.markRead(id).subscribe({
        next: (res: any) => {},
        error: (e: any) => {
          console.log(e);
        },
      });
      this.jobsService.jobId$.next(jobId);
      this.jobsService.showApplicants$.next(true);
      if (path.includes('/job/')) {
        this.jobsService.jobById(id).subscribe({
          next: (res: any) => {
            this.jobsService.passJob(res);
            this.router.navigateByUrl(`${path}`);
          },
          error: (e: any) => [console.log(e)],
        });
      }
    }
  }
}
