import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, skip, takeLast, tap } from 'rxjs';
import { DeleteChatComponent } from 'src/app/delete-chat/delete-chat.component';
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
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
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
  // user: User = {};
  toUser: string = '';
  contact: boolean = false;
  newMessage: string = '';
  msgs: Message[] = [];
  loadingContacts: boolean = false;
  loadingMsgs: boolean = false;
  contactStats: any = [];
  message: string = '';
  file: any;
  show_deleteChat_popup: boolean = false;
  @ViewChild('searchInput', { read: ElementRef })
  searchBox!: ElementRef;
  @ViewChild('msgBox', { read: ElementRef })
  msgBox!: ElementRef;
  search_value = '';
  durationInSeconds = 2;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

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
  // prevValue!: number;
  // checkHeight(e: any) {
  //   e.target.style.height = `${e.target.scrollHeight}px`;
  //   if (
  //     !Boolean(this.prevValue < e.target.scrollHeight) &&
  //     e.target.value.length < 1
  //   )
  //     e.target.style.height = `50px`;
  //   this.prevValue = e.target.scrollHeight;
  // }

  search(e: any) {
    if (e.which == 27 || e.target.value == '') {
      this.search_value = '';
      this.users = [];
      return;
    }
    this.userService.users$.subscribe((users) => {
      this.users = users.filter(
        (user) =>
          user.name?.includes(this.search_value.trim()) ||
          user.email?.includes(this.search_value.trim())
      );
    });
  }

  //! Getting selected user's id
  profileBiId(e: any, user: User, i: number) {
    if (this.loadingMsgs) return;
    if (this.contacts.some((el) => el._id == user._id)) {
      this.router.navigate([`/messaging`], {
        queryParams: { contact: user._id },
      });
    } else {
      this.router.navigate([`/messaging`], { queryParams: { new: user._id } });
      this.msgs = [];
      localStorage.setItem('newContact', JSON.stringify(user));
    }
    this.search_value = '';
    this.users = [];
    this.read_msgs(e, user._id as string);
  }

  //! Sending message to selected user
  sendMsg() {
    if (this.message == '' && !this.file) return;
    // Emit to socket
    this.userService.emitMsg(
      this.toUser,
      this.message,
      this.file,
      this.file?.name,
      `${this.bytesToSize(this.file?.size)}`
    );

    // Update msgs stream
    this.userService.msgs$
      .pipe(
        tap((msgs) => {
          msgs.unshift({
            message: this.message,
            from: localStorage['id'],
            to: this.toUser,
            time: `${Date.now()}`,
            file: this.file,
            sent: true,
            file_name: this.file?.name,
            file_size: `${this.bytesToSize(this.file?.size)}`,
          });
        })
      )
      .subscribe();

    // Updating chat
    this.msgs.unshift({
      message: this.message,
      time: `${Date.now()}`,
      file: this.file,
      sent: true,
      file_name: this.file?.name,
      file_size: `${this.bytesToSize(this.file?.size)}`,
    });

    setTimeout(() => {
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    }, 0);

    // Save to DB
    this.userService.message(this.toUser, this.message, this.file).subscribe({
      next: async (res: any) => {},
      error: (e: any) => {
        console.log(e);
      },
    });

    // Add new contact
    if (
      this.contacts.length == 0 ||
      !this.contacts.some((el: any) => el._id == this.toUser)
    ) {
      this.contacts = [...this.contacts, this.currContact];
      this.contactStats = [
        ...this.contactStats,
        { contact: this.toUser, sent_newMsg: false },
      ];
      this.userService.newContacts$.next(this.contacts);
      this.userService.contactStats$.next(this.contactStats);
    }

    this.message = '';
    this.file = null;
  }
  getFile(e: any) {
    this.file = e.target.files[0];
  }
  bytesToSize(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  }
  page = 0;
  pageLimit = 100;
  getMsgs(id: any) {
    this.message = '';
    this.msgs = [];
    this.page = 0;
    this.loadMsgs(id, this.page);
  }
  loadMsgs(id: any, page: number) {
    this.userService.msgs$.subscribe((msgs) => {
      const filtered = msgs.filter(
        (msg: any) => msg.to == id || msg.from == id
      );
      this.msgs = this.msgs.concat(
        filtered.splice(this.pageLimit * page, this.pageLimit)
      );
    });
  }
  forBoth: boolean = false;
  rmContact: boolean = false;

  delChatDialog() {
    this.dialog.open(DeleteChatComponent, {
      width: '350px',
    });
  }

  delChat(id: string) {
    this.userService.delChat(id, this.forBoth, this.rmContact).subscribe({
      next: (res: any) => {
        this.dialog.closeAll();
        this.delMsgs(id);
        if (this.rmContact) this.delContact(id);
        if (this.forBoth)
          this.userService.emitToDelete(localStorage['id'], id, this.rmContact);
        this._snackBar.open(`${res.message}`, '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: this.durationInSeconds * 1000,
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  delMsgs(id: string) {
    const messages = this.userService.msgs$.getValue();
    const toKeep = messages.filter(
      (msg: any) => !(msg.to === id || msg.from === id)
    );
    this.userService.msgs$.next(toKeep);
    this.msgs = [];
  }
  delContact(id: string) {
    this.contacts = this.contacts.filter((el: any) => el._id != id);
    this.contactStats = this.contactStats.filter((el: any) => el.contact != id);
    this.userService.newContacts$.next(this.contacts);
    this.userService.contactStats$.next(this.contactStats);
    this.router.navigate([`/messaging`]);
  }

  read_msgs(e: any, id: string) {
    if (!this.contactStats.some((el: any) => el.contact == id)) return;
    if (
      this.contactStats.find((el: any) => el.contact == id).sent_newMsg == false
    )
      return;
    const contact = e.target.closest('.contact');
    const chat = e.target.closest('.chat');
    if (contact || (chat && this.route.snapshot.queryParams['contact'] == id)) {
      contact?.classList.remove('unread');
      this.userService.contactStats$
        .pipe(
          tap((list) => {
            list.find((el: any) => el.contact == id).sent_newMsg = false;
          })
        )
        .subscribe((res) => {
          // Send no of contacts with unread messages
          const unread = res.filter((el: any) => el.sent_newMsg).length;
          this.userService.unread_msgs$.next(unread);
        });
      // Mark read in DB
      this.userService.readMsgs(id).subscribe({
        next: (res) => {},
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  checkUnread(id: any): boolean {
    return this.contactStats.find((el: any) => el.contact == id)?.sent_newMsg;
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
    this.userService.loadingContacts$.subscribe(
      (res) => (this.loadingContacts = res)
    );
    // Listen for new contacts
    this.userService.newContacts$.subscribe((res) => {
      this.contacts = res;
      this.currContact =
        this.contacts.find((el) => el._id == this.toUser) || {};
    });

    this.userService.contactStats$.subscribe((res) => {
      this.contactStats = res;
      // Send no of contacts with unread messages
      this.userService.unread_msgs$.next(
        res.filter((el: any) => el.sent_newMsg).length
      );
    });

    this.userService.onlineContacts().subscribe((res) => {
      this.contacts = this.contacts.map((contact) => {
        const isOnline = res.onlineContacts?.some(
          (el: any) => el == contact._id
        );
        if (isOnline) {
          contact.online = true;
          contact.lastActive = res.time;
          this.userService.markOnline(contact._id);
        } else {
          contact.online = false;
          this.userService.markOfline(contact._id);
        }
        return contact;
      });
    });
    let contact: string;
    let newContact: string;
    this.intersectionObserver = new IntersectionObserver(
      (enteries) => {
        enteries.forEach((e) => {
          if (e.isIntersecting && this.msgs.length >= this.pageLimit) {
            this.page++;
            this.loadMsgs(contact, this.page);
          }
        });
      },
      {
        threshold: 0,
      }
    );
    const focusMsgBox = () => {
      this.userService.loadingContacts$.subscribe((res) => {
        if (!res) {
          setTimeout(() => {
            this.msgBox?.nativeElement.focus();
          }, 0);
        }
      });
    };
    this.route.queryParamMap.subscribe((params) => {
      contact = this.toUser = params.get('contact') || '';
      newContact = params.get('new') || '';
      if (contact) {
        focusMsgBox();
        this.contact = true;
        this.toUser = contact;
        this.currContact =
          this.contacts.find((el: any) => el._id == contact) || {};
        this.getMsgs(contact);
        this.userService.contactChatRoom(localStorage['id'], contact);
      } else if (newContact) {
        focusMsgBox();
        this.contact = true;
        this.toUser = newContact;
        this.currContact = JSON.parse(localStorage['newContact']);
        if (this.contacts.find((el: any) => el._id == newContact))
          this.getMsgs(newContact);
        this.userService.contactChatRoom(localStorage['id'], newContact);
      } else {
        this.contact = false;
        this.router.navigate(['/messaging']);
        setTimeout(() => {
          this.searchBox.nativeElement.focus();
        }, 10);
      }
    });

    // Listening to new messages
    this.userService.getNewMessage().subscribe((message: any) => {
      const newMsg = {
        to: message.to,
        from: message.from,
        message: message.msg,
        time: message.time,
        sent: message.sent,
        file: message.file,
        file_name: message.fileName,
        file_size: message.fileSize,
      };

      this.msgs.unshift(newMsg);
      this.userService.msgs$
        .pipe(tap((msgs) => msgs.unshift(newMsg)))
        .subscribe();

      setTimeout(() => {
        if (this.chat)
          this.chat.nativeElement.scrollTop =
            this.chat.nativeElement.scrollHeight;
      }, 0);
    });

    // Request to delete chat
    this.userService
      .toDeleteChat()
      .pipe(filter((res) => Object.keys(res).length != 0))
      .subscribe((res) => {
        this.delMsgs(res.contact);
        if (res.rmContact) {
          this.delContact(res.contact);
        }
      });

    this.userService.closeDialog$.subscribe((res) => {
      if (res) this.dialog.closeAll();
    });
    this.userService.signalToDelete$.pipe(skip(1)).subscribe((res) => {
      this.forBoth = res.forBoth;
      this.rmContact = res.rmContact;
      this.delChat(res.id);
    });
  }
}
