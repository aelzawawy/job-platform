import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import {
  Router,
  Event,
  NavigationStart,
  NavigationEnd,
  NavigationError,
} from '@angular/router';
import { Location } from '@angular/common';
import { Message } from 'src/app/interfaces/message';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor() // private userService: UserService,
  // private router:Router,
  {
    // this.currentRoute = "";
    // this.router.events.subscribe((event: Event) => {
    //     if (event instanceof NavigationEnd) {
    //         this.currentRoute = event.url;
    //         const navLinks = document.querySelectorAll('.navigation__link');
    //         navLinks.forEach(link => link.classList.remove('click'));
    //         const home = document.querySelector('.home') as HTMLElement;
    //         const msging = document.querySelector('[routerLink="/messaging"]') as HTMLElement;
    //         const login = document.querySelector('[routerLink="/login"]') as HTMLElement;
    //         const employers = document.querySelector('[routerLink="/employers"]') as HTMLElement;
    //         const profile = document.querySelector('.profile-box') as HTMLElement;
    //         if(this.currentRoute == '/'){
    //           home.classList.add('click');
    //         }else if(this.currentRoute == '/messaging'){
    //           msging.classList.add('click');
    //         }else if(this.currentRoute == '/profile'){
    //           profile?.classList.add('click');
    //         }else if(this.currentRoute == '/login'){
    //           login.classList.add('click');
    //         }else if(this.currentRoute == '/employers'){
    //           employers.classList.add('click');
    //         }
    //     }
    //     if (event instanceof NavigationError) {
    //       console.log(event.error);
    //     }
    // });
  }
  // currentRoute: string;
  // state = this.router.routerState;
  // active(e:any){
  //   const nav = e.target.closest('.navigation__list') ;
  //   const navLinks = document.querySelectorAll('.navigation__link')
  //   if(e.target != nav && !e.target.classList.contains('vline')){
  //     navLinks.forEach(link => link.classList.remove('click'))
  //     e.target.classList.add('click')
  //   }
  // }

  logOut() {
    localStorage.removeItem('token');
    this.loggedIn();
  }
  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
  }

  // users: User[] = [];
  user: User = {};
  // msgs: Message[] = [];
  // msgscount = 0;

  // messages() {
  //   this.userService.profile().subscribe({
  //     next: (res: any) => {
  //       this.msgs = res.messages;
  //       this.user = res;
  //       this.msgscount = this.msgs.length;
  //       // console.log(...this.msgs);
  //     },
  //     error: (err: any) => {
  //       console.log(err);
  //     },
  //   });
  // }

  // delMsg(id: any, i: number) {
  //   this.userService.delMsg(id).subscribe({});
  //   this.msgs.splice(i, 1);
  //   this.msgscount--;
  // }

  ngOnInit(): void {
    // if(this.loggedIn()){
    //   this.userService.profile().subscribe({
    //     next: (res: any) => {
    //       this.user = res;
    //     },
    //     error: (err: any) => {
    //       console.log(err);
    //     },
    //   });
    // }
  }
}
