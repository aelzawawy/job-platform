import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Message } from 'src/app/interfaces/message';
import { User } from 'src/app/interfaces/user';
import { ObserverService } from 'src/app/services/observer.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
})
export class MessagingComponent implements OnInit, AfterViewInit {
  constructor(
    private userService: UserService,
    private observer: ObserverService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isHandset$ = this.observer.isHandset$;
    this.isHandsetMd$ = this.observer.isHandsetMd$;
  }
  @ViewChildren('topMsg', { read: ElementRef })
  topMsg!: QueryList<ElementRef>;
  @ViewChild('chat', { read: ElementRef })
  chat!: ElementRef;
  isHandset$!: Observable<boolean>;
  isHandsetMd$!: Observable<boolean>;
  intersectionObserver: any;
  users: User[] = [];
  contacts: User[] = [];
  currContact: User = {};
  user: User = {};
  toUser:string = '';
  contact: boolean = false;
  newMessage: string = '';
  msgs: Message[] = [];
  loadingContacts: boolean = false;

  message: string = '';
  file: any;
  sent: boolean = false;

  ngAfterViewInit(): void {
    this.topMsg.changes.subscribe((msgs) => {
      if (msgs.last) this.intersectionObserver.observe(msgs.last.nativeElement);
    });
  }

  // context_menu:any = {}.nativeElement
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
  search_value = '';
  profileBiId(e: any, id: any) {
    this.router.navigate([`/messaging`], { queryParams: { contact: id } });
    this.search_value = ''
    this.users = [];
  }

  //! Sending message to selected user
  sendMsg() {
    if (this.message == '' && !this.file) return;
    this.userService
    .message(this.toUser, this.message, this.file)
    .subscribe({
      next: async (res: any) => {
        this.userService.emitMsg(this.toUser, res.message, res.file, res.file_name, res.file_size)
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
    this.file = null;
  }
  getFile(e: any) {
    this.file = e.target.files[0];
  }
  page = 0;
  getMsgs(id: any) {
    this.message = '';
    this.msgs = [];
    this.page = 0;
    this.userService.getMsgs(id).subscribe({
      next: (res: any) => {
        this.msgs = this.msgs.concat(res.reverse().splice(30 * this.page, 30));
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
    this.router.navigateByUrl('/messaging');
  }

  ngOnInit(): void {
    this.currentUser();
    let contact: string;
    this.intersectionObserver = new IntersectionObserver(
      (enteries) => {
        enteries.forEach((e) => {
          if (e.isIntersecting) {
            this.userService.getMsgs(contact).subscribe({
              next: (res: any) => {
                this.page++;
                this.msgs = this.msgs.concat(
                  res.reverse().splice(15 * this.page, 15)
                );
              },
              error: (err: any) => {
                console.log(err);
              },
            });
          }
        });
      },
      {
        threshold: 0,
      }
    );
    this.route.queryParamMap.subscribe((params) => {
      contact = params.get('contact') || '';
      if (contact && this.contacts.length!=0) {
        this.contact = true;
        this.toUser = contact
        this.currContact = this.contacts.find(el => el._id == contact) || {}
        this.getMsgs(contact);
        this.userService.contactChatRoom(localStorage['id'], contact);
      } else {
        this.contact = false;
        this.router.navigate(['/messaging'])
      }
    });
    this.userService.getNewMessage().subscribe((message: any) => {
      if (message == '') return;
      this.msgs.unshift({
        message: message.msg,
        time: message.time,
        sent: message.sent,
        file: message.file,
        file_name: message.fileName,
        file_size: message.fileSize,
      });
      // this.lastMsg = { message: message, time: `${Date.now()}`}
    });
  }
}
