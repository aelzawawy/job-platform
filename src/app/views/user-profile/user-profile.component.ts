import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router, ActivatedRoute} from '@angular/router';
import { JobsService } from 'src/app/services/jobs.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private jobsService: JobsService,
    // private location: Location,
    // private fb: FormBuilder,
    // public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.user = this.jobsService.currUser;
  }

  user:User = {}
}
