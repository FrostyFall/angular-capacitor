import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CallService } from '../shared/call.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../shared/users.service';
import { Observable } from 'rxjs';
import { IUser } from '../shared/interfaces/user.interface';
import { LocalStorageService } from '../shared/local-storage.service';
import { IGuestUser } from '../shared/interfaces/guest-user.interface';
import { RoomsService } from '../shared/rooms.service';
import { RoomMembersService } from '../shared/room-members.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private callService = inject(CallService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private localStorageService = inject(LocalStorageService);
  private roomsService = inject(RoomsService);
  private roomMembersService = inject(RoomMembersService);

  isLoggedIn: boolean = false;
  user!: IUser | null;

  form = new FormGroup({
    peerIdControl: new FormControl(''),
    nameControl: new FormControl(''),
  });

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.usersService.user$.subscribe((user) => (this.user = user));

    if (this.isLoggedIn) {
      this.authService.retrieveUserFromStorage();
    }
  }

  onCreateRoom() {
    const uuid = this.callService.generateUuid();

    this.roomsService.create(uuid).subscribe({
      next: () =>
        this.router.navigate(['rooms', uuid], {
          relativeTo: this.activatedRoute,
        }),
    });
  }

  onJoinRoom() {
    const uuid = this.form.getRawValue().peerIdControl;

    if (!uuid) {
      alert('Peer ID was not typed in');
      return;
    }

    this.router.navigate(['rooms', uuid], {
      relativeTo: this.activatedRoute,
    });
  }

  onLogin() {
    this.router.navigate(['auth'], { relativeTo: this.activatedRoute });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['auth'], { relativeTo: this.activatedRoute });
  }
}
