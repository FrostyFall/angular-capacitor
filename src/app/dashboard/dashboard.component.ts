import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CallService } from '../shared/call.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../shared/users.service';
import { IUser } from '../shared/interfaces/user.interface';
import { RoomsService } from '../shared/rooms.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly callService = inject(CallService);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly roomsService = inject(RoomsService);
  private readonly destroyRef = inject(DestroyRef);

  public isLoggedIn: boolean = false;
  public user!: IUser | null;
  public form = new FormGroup({
    peerIdControl: new FormControl(''),
    nameControl: new FormControl(''),
  });

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.usersService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => (this.user = user));

    if (this.isLoggedIn) {
      this.authService.retrieveUserFromStorage();
    }
  }

  public onCreateRoom(): void {
    const uuid = this.callService.generateUuid();

    this.roomsService
      .create(uuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.router.navigate(['rooms', uuid], {
            relativeTo: this.activatedRoute,
          }),
      });
  }

  public onJoinRoom(): void {
    const uuid = this.form.getRawValue().peerIdControl;

    if (!uuid) {
      alert('Peer ID was not typed in');
      return;
    }

    this.router.navigate(['rooms', uuid], {
      relativeTo: this.activatedRoute,
    });
  }

  public onLogin(): void {
    this.router.navigate(['auth'], { relativeTo: this.activatedRoute });
  }

  public onLogout(): void {
    this.authService.logout();
    this.router.navigate(['auth'], { relativeTo: this.activatedRoute });
  }
}
