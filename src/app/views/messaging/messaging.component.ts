import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { FormBuilder, FormControl } from '@angular/forms';
import { Message } from 'src/app/interfaces/message';
// import { formatDate } from '@angular/common';

// let fromUser = '';
// let toUser = '';
@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
})
export class MessagingComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  users: User[] = [];
  contacts: User[] = [];
  user: User = {};
  toUser: User = {};
  newMessage: string = '';
  messageList: string[] = [];
  msgs: Message[] = [];
  loading:boolean = false;
  lastMsg = {
    message: '',
    time:''
  }
  msgscount = 0;
  sent: boolean = false;
  loggedIn: boolean = false;
  msgForm = this.fb.group({
    message: [],
  });

  search(event: any) {
    const input = event.target.value;
    if (input == ''){
      this.users = [];
    }else{
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

  // Getting selected user's id
  profileBiId(e: any, id: any) {
    const sideBar = document.querySelector('.chat-sidebar') as HTMLElement;
    const chat = document.querySelector('.chat') as HTMLElement;
    const searchInput = document.querySelector('.searchInput') as HTMLInputElement;

    searchInput.value = '';
    this.users = [];

    if(!this.toUser._id || this.toUser._id != id){
      this.userService.contactChatRoom(this.user._id,id)
      this.userService.profileById(id).subscribe({
        next: (res: any) => {
          this.toUser = res;
          this.windowListener(this.toUser);
          this.getMsgs(this.toUser._id);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    }

    if (window.innerWidth <= 767) {
      chat.style.display = 'flex';
      chat.style.flex = '1';
      sideBar.style.flex = '0';
    }
  }

  // Sending message to selected user
  message(data: any) {
    const msg = document.querySelector('#msg') as HTMLInputElement;
    if (!data.message || msg.value == '') return;
    this.userService.message(this.toUser._id, data).subscribe();
    msg.value = '';
    let timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      const chatMsgs = document.querySelector('.chat-messages') as HTMLElement;
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }, 1);
  }

  getMsgs(id:any){
    this.loading = true;
    this.userService.getMsgs(id).subscribe({
      next: (res:any) => {
        this.msgs = res;
        const chatMsgs = document.querySelector('.chat-messages') as HTMLElement;
        // setTimeout(() => {
        //   chatMsgs.scrollTop = chatMsgs.scrollHeight;
        // }, 1);
        this.scroll(chatMsgs);
        setTimeout(() => {
          this.loading = false;
        }, 1);
      },
      error: (err:any) => {
        console.log(err);
      }
    })
  }
  scroll(el:HTMLElement){
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 10);
  }

  currentUser() {
    this.userService.profile().subscribe({
      next: (res: any) => {
        this.user = res;
        this.userService.curretUser(res._id)
        // fromUser = `${res._id}`
        // this.lastMsg = res.messages.pop()
        
        res.messages.forEach((msg: any) => {
          if (msg.sent) {
            this.sent = true;
          } else {
            this.sent = false;
          }
        });

        res.contactList?.forEach((item: any) => {
          this.userService.profileById(item.contact).subscribe({
            next: (res: any) => {
              this.contacts.push(res);
            },
            error: (err: any) => {
              console.log(err);
            },
          });
        });
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  delMsg(id: any, i: number) {
    this.userService.delMsg(id).subscribe({});
    this.msgs.splice(i, 1);
    this.msgscount--;
  }

  // Default profile pic
  profilePic(user: any): boolean {
    if (!user.image) {
      return true;
    }
    return false;
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

  liggedIn(): boolean {
    if (localStorage['token']) {
      this.loggedIn = true;
      return true;
    }
    this.loggedIn = false;
    return false;
  }

  backButton(e: any) {
    const sideBar = document.querySelector('.chat-sidebar') as HTMLElement;
    const chat = document.querySelector('.chat') as HTMLElement;
    const backBtn = chat.firstChild?.firstChild;
    this.toUser = {};
    if (window.innerWidth <= 767) {
      chat.style.display = 'none';
      chat.style.borderLeft = 'none';
      chat.style.flex = '0';
      sideBar.style.flex = '1';
    }
  }
  windowListener(user: any) {
    const sideBar = document.querySelector('.chat-sidebar') as HTMLElement;
    const chat = document.querySelector('.chat') as HTMLElement;

    let timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      const chatImg = chat.firstChild?.childNodes[1] as HTMLElement;
      if (window.innerWidth <= 767) {
        chatImg.style.display = 'block';
      } else {
        chatImg.style.display = 'none';
      }
    }, 1);
    window.addEventListener('resize', function () {
      let timer: ReturnType<typeof setTimeout> = setTimeout(() => {
        const chatImg = chat.firstChild?.childNodes[1] as HTMLElement;
        if (chat.firstChild?.childNodes.length == 0) return;
        if (window.innerWidth <= 767) {
          chatImg.style.display = 'block';
        } else {
          chatImg.style.display = 'none';
        }
      }, 50);

      if (user) {
        if (window.innerWidth > 767) {
          sideBar.style.display = 'block';
          chat.style.display = 'flex';
          chat.style.flex = '.6';
          sideBar.style.flex = '.4';
        } else {
          chat.style.display = 'none';
          chat.style.flex = '0';
          sideBar.style.flex = '1';
        }
      }
    });
  }
  

  ngOnInit(): void {
    this.currentUser();

    this.userService.getNewMessage().subscribe((message: any) => {
      this.msgs.push({
        message: message.msg,
        time: message.time,
        sent: message.sent
      });
      // this.lastMsg = { message: message, time: `${Date.now()}`}
    });
    
  }
}