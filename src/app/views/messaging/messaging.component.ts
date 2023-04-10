import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { FormBuilder, FormControl } from '@angular/forms';
import { Message } from 'src/app/interfaces/message';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
})
export class MessagingComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
  ) {}

  users: User[] = [];
  contacts: User[] = [];
  user: User = {};
  toUser: User = {};
  contact:boolean = false;
  newMessage: string = '';
  messageList: string[] = [];
  msgs: Message[] = [];
  loading: boolean = false;
  loadingContacts: boolean = false;

  message: string = '';
  file: any;
  sent: boolean = false;

  // context_menu:any = {}
  // Context menu
  // openContext(e:any, msg:any, i:number){
  //   if(e.which == 3){
  //     this.context_menu={
  //       'display': 'block',
  //       'position': 'absolute',
  //       'top': e.clientY,
  //       'left': e.clientX,
  //     }
  //   }
  // }

  // closeMenu(){
    
  //   console.log('outside')
  //   this.context_menu = {
  //     'display': 'none'
  //   }
    
  // }
  
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(
      map((result) => result.matches),
      shareReplay()
  );

  search(event: any) {
    const input = event.target.value;
    if (input == '') {
      this.users = [];
    } else {
      this.userService.search(input?.trim()).subscribe({
        next: (res: any) => {
          this.users = res;
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    }
  }

  //! Getting selected user's id
  profileBiId(e: any, id: any) {
    this.router.navigateByUrl('/messaging')
    this.router.navigate([`/messaging`], {queryParams: {contact: id}})
    const searchInput = document.querySelector(
      '.searchInput'
    ) as HTMLInputElement;

    searchInput.value = '';
    this.users = [];
  }

  //! Sending message to selected user
  sendMsg() {
    const msg = document.querySelector('#msg') as HTMLInputElement;
    const chatMsgs = document.querySelector('.chat-messages') as HTMLElement;

    if ((this.message == '' || msg.value == '') && !this.file) return;
    this.userService
      .message(this.toUser._id, this.message, this.file)
      .subscribe({
        next: (res: any) => {
          this.msgs.unshift({
            id: res.id,
            message: res.message,
            time: res.time,
            file: res.file,
            sent: res.sent,
            file_name: res.file_name,
            file_size: res.file_size,
          });
        },
        error: (e: any) => {
          console.log(e);
        },
      });
    this.message = '';
    msg.value = '';
    this.file = null;
    setTimeout(() => {
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }, 100);
  }
  getFile(e: any) {
    this.file = e.target.files[0];
  }

  getMsgs(id: any) {
    this.loading = true;
    this.message = '';
    this.userService.getMsgs(id).subscribe({
      next: (res: any) => {
        this.msgs = res.reverse();
        this.loading = false;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  currentUser() {
    this.loadingContacts = true;
    this.userService.profile().subscribe({
      next: (res: any) => {
        this.user = res;
        this.userService.currentUser(res._id);
        if (res.contactList) {
          this.userService.getContacts().subscribe({
            next: (res: any) => {
              this.contacts = res;
              this.loadingContacts = false;
            },
            error: (err: any) => {
              console.log(err);
            },
          });
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  // Date formatting
  formatDate = function (date: any) {
    const calcPassedDays = (now: any, postDate: any) =>
      Math.round(Math.abs(postDate - now) / (1000 * 60 * 60 * 24));
    const PassedDays = calcPassedDays(new Date(), date);
    if (PassedDays === 0)
      return `${new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)}`;

    if (PassedDays === 1)
      return `${new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)}`;

    // if (PassedDays <= 7) return `${PassedDays} days ago`;
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  };

  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
  }

  backButton(e: any) {
    this.router.navigateByUrl('/messaging')
}

  ngOnInit(): void {
    this.currentUser();
    this.route.queryParamMap.subscribe(params => {
      const contact = params.get('contact');
      if (contact) {
        this.contact = true;
        this.userService.profileById(contact).subscribe({
          next: (res: any) => {
            this.toUser = res;
          },
          error: (err: any) => {
            console.log(err);
          },
        });
        this.getMsgs(contact);
        this.userService.contactChatRoom(this.user._id, contact);
      }else{
        this.contact = false;
      }
    })
    this.userService.getNewMessage().subscribe((message: any) => {
      this.msgs.push({
        message: message.msg,
        time: message.time,
        sent: message.sent,
      });
      // this.lastMsg = { message: message, time: `${Date.now()}`}
    });
  }
}
