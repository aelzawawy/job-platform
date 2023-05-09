import { Component, OnInit } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../environments/environment';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'REACH';
  constructor(private userService: UserService){}
  ngOnInit(): void {
    if (localStorage['token']) {
      this.requestPermission();
      this.listen();
    }
    this.userService.getSignal().subscribe(res => {
      this.requestPermission();
      this.listen();
    })
  }
  requestPermission() {
    const messaging = getMessaging();
    getToken(messaging, { vapidKey: environment.firebase.vapidKey })
      .then((currentToken) => {
        if (currentToken) {
          this.userService.saveToken(currentToken).subscribe({
            next: (res: any) => {
              console.log(res)
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
      console.log(payload);
    });
    
  }
}
