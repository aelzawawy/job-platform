import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { filter, skip, tap } from 'rxjs';
import { JobsService } from 'src/app/services/jobs.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'REACH';
  contacts: any = [];
  constructor(
    private userService: UserService,
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnDestroy(): void {
    this.userService.disconnect(localStorage['id']);
  }
  ngOnInit(): void {
    if (localStorage['token']) {
      // Add new user socket
      this.userService.currentUser(localStorage['id']);
      // Preload users to reduce search time
      this.userService.loadUsers();
      // Preload contacts
      this.userService.getContacts();
      // Push notifications permission
      this.requestPermission();
      // Listening to incoming notifications in foreground/background
      this.listen();
      this.userService.get_notifications();
      this.userService.get_contactStats();
      this.checkContatcs();
      if (JSON.parse(localStorage['user']).roles == 'employer')
        this.jobsService.getPosts();
      this.userService.getMsgs();
    }
    // For when the user logs-In or signs-Up
    this.userService.getSignal().subscribe((res) => {
      this.userService.currentUser(localStorage['id']);
      this.userService.loadUsers();
      this.userService.getContacts();
      this.requestPermission();
      this.listen();
      this.userService.get_notifications();
      this.userService.get_contactStats();
      this.checkContatcs();
      this.userService.getMsgs();
      if (JSON.parse(localStorage['user']).roles == 'employer')
        this.jobsService.getPosts();
    });
  }

  checkContatcs() {
    this.userService.newContacts$.pipe(skip(1)).subscribe((res) => {
      this.contacts = res;
    });
  }

  requestPermission() {
    const messaging = getMessaging();
    getToken(messaging, { vapidKey: environment.firebase.vapidKey })
      .then((currentToken) => {
        if (currentToken) {
          this.userService.saveToken(currentToken).subscribe({
            next: (res: any) => {
              console.log(res);
            },
            error: (e: any) => {
              console.log(e);
            },
          });
        } else {
          console.log(
            'No registration token available. Request permission to generate one.'
          );
        }
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
      });
  }
  listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      if (payload.data?.['pathname'].includes('messaging')) {
        // Update contacts if new
        if (
          this.contacts.length == 0 ||
          !this.contacts.some((el: any) => el._id == payload.data?.['sender'])
        ) {
          this.userService.getContacts();
          this.userService.get_contactStats();
          this.userService.getMsgs();
        } else {
          // If (not new && not in the my chat), just mark unread, and update badge number
          const inChat = Boolean(
            this.route.snapshot.queryParams['contact'] ==
              payload.data?.['sender']
          );

          this.userService.contactStats$
            .pipe(
              tap((list) => {
                list.find(
                  (el: any) => el.contact == payload.data?.['sender']
                ).sent_newMsg = !inChat;
              })
            )
            .subscribe((res) => {
              if (inChat) {
                // Save as read in the DB
                this.userService.readMsgs(payload.data?.['sender']).subscribe();
              } else {
                const unread = res.filter((el: any) => el.sent_newMsg).length;
                this.userService.unread_msgs$.next(unread);
              }
            });
        }
      }
      // else if (payload.data?.['pathname'].includes('notifications')) {
      //   this.userService.notifications$
      //     .pipe(
      //       tap((list) =>
      //         list.unshift({
      //           time: payload.data?.['time'],
      //           body: `${payload.data?.['title']} ${payload.data?.['body']}`,
      //           path: payload.data?.['pathname'],
      //           read: false,
      //         })
      //       )
      //     )
      //     .subscribe((res) => {
      //       const unread = res.filter((el: any) => !el.read).length;
      //       this.userService.unread_notifications$.next(unread);
      //     });
      // }
      this.userService.get_notifications();
      if (JSON.parse(localStorage['user']).roles == 'employer') {
        this.jobsService.getPosts();
      }
    });
  }
}
