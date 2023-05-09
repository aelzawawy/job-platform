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
  toUser: string = '';
  contact: boolean = false;
  newMessage: string = '';
  msgs: Message[] = [];
  loadingContacts: boolean = false;
  loadingMsgs: boolean = false;
  searching: boolean = false;

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
    if(input == ''){
      this.users = [];
      return;
    }
    setTimeout(() => {
      if(input === this.search_value && !this.searching) {
        this.searching = true;
        this.userService.search(input?.trim()).subscribe({
          next: (res: any) => {
            this.users = res;
            this.searching = false;
          },
          error: (err: any) => {
            console.log(err);
            this.searching = false;
          },
        });
      }
    }, 500);
  }

  //! Getting selected user's id
  search_value = '';
  profileBiId(e: any, user: User) {
    if(this.loadingMsgs) return;
    if(this.contacts.some(el => el._id == user._id)){
      this.router.navigate([`/messaging`], { queryParams: { contact: user._id } })
    }else{
      this.router.navigate([`/messaging`], { queryParams: { new: user._id } });
      this.msgs = [];
      localStorage.setItem('newContact', JSON.stringify(user));
    }
    this.search_value = '';
    this.users = [];
  }

  //! Sending message to selected user
  sendMsg() {
    if (this.message == '' && !this.file) return;
    this.userService.emitMsg(
      this.toUser,
      this.message,
      this.file,
      this.file?.name,
      `${this.bytesToSize(this.file?.size)}`
    );
    this.msgs.unshift({
      message: this.message,
      time: `${Date.now()}`,
      file: this.file,
      sent: true,
      file_name: this.file?.name,
      file_size: `${this.bytesToSize(this.file?.size)}`,
    });
    if(!this.contacts.some((el:any) => el._id == this.toUser)) {
      this.contacts.push(this.currContact)
      localStorage.setItem('contacts', JSON.stringify(this.contacts))
    }
    setTimeout(() => {
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    }, 0);
    this.userService.message(this.toUser, this.message, this.file).subscribe({
      next: async (res: any) => {},
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
  bytesToSize(bytes:number) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes == 0) return "n/a";
    const i:number = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i == 0) return bytes + " " + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  }
  page = 0;
  getMsgs(id: any) {
    this.loadingMsgs = true;
    this.message = '';
    this.msgs = [];
    this.page = 0;
    this.userService.getMsgs(id).subscribe({
      next: (res: any) => {
        this.msgs = this.msgs.concat(res.reverse().splice(30 * this.page, 100));
        this.loadingMsgs = false;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  currentUser() {
    this.userService.currentUser(localStorage['id']);
    this.loadingContacts = true;
    this.contacts = JSON.parse(localStorage['contacts'] || '[]');
    this.loadingContacts = false;
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
  // lastMsg = {
  //   message: '',
  //   time: ''
  // }
  ngOnInit(): void {
    this.currentUser();
    let contact: string;
    let newContact: string;
    this.intersectionObserver = new IntersectionObserver(
      (enteries) => {
        enteries.forEach((e) => {
          if (e.isIntersecting && this.msgs.length > 100) {
            this.loadingMsgs = true;
            this.userService.getMsgs(contact || newContact).subscribe({
              next: (res: any) => {
                this.page++;
                this.msgs = this.msgs.concat(
                  res.reverse().splice(100 * this.page, 100)
                  );
                  this.loadingMsgs = false;
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
      newContact = params.get('new') || '';
      if (contact) {
        this.contact = true;
        this.toUser = contact;
        this.currContact = this.contacts.find((el:any) => el._id == contact) || {};
        this.getMsgs(contact);
        this.userService.contactChatRoom(localStorage['id'], contact);
      }else if (newContact) {
        this.contact = true;
        this.toUser = newContact;
        this.currContact = JSON.parse(localStorage['newContact'] || '[]') || {};
        if(this.contacts.some((el:any) => el._id == newContact)) this.getMsgs(newContact);
        this.userService.contactChatRoom(localStorage['id'], newContact);
      }else {
        this.contact = false;
        this.router.navigate(['/messaging']);
      }
    });
    this.userService.getNewMessage().subscribe((message: any) => {
      this.msgs.unshift({
        message: message.msg,
        time: message.time,
        sent: message.sent,
        file: message.file,
        file_name: message.fileName,
        file_size: message.fileSize,
      });
      // this.lastMsg = { message: message.msg, time: `${message.time}`}
    });
  }
}