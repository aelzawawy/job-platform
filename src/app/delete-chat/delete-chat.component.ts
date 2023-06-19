import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../interfaces/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-delete-chat',
  templateUrl: './delete-chat.component.html',
  styleUrls: ['./delete-chat.component.scss'],
})
export class DeleteChatComponent {
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  currContact: User = {};
  forBoth: boolean = false;
  rmContact: boolean = false;
  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('contact') || params.get('new');
      this.userService.users$.subscribe((res) => {
        this.currContact = res.find((el: any) => el._id == id) || {};
      });
    });
  }

  signalToDelete(id: string) {
    this.userService.signalToDelete$.next({
      id,
      forBoth: this.forBoth,
      rmContact: this.rmContact,
    });
  }
  cancel() {
    this.userService.closeDialog$.next(true);
  }
}
