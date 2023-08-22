import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, first, switchMap } from 'rxjs';
import { Socket } from 'ngx-socket-io';

import { CallService } from '../shared/call.service';
import { UsersService } from '../shared/users.service';
import { IUser } from '../shared/interfaces/user.interface';
import { RoomsService } from '../shared/rooms.service';
import { IRoom } from '../shared/interfaces/room.interface';
import { RoomMembersService } from '../shared/room-members.service';
import { AuthService } from '../auth/auth.service';
import { CopySvgComponent } from '../shared/components/copy-svg/svg.component';
import { ChatSvgComponent } from '../shared/components/chat-svg/svg.component';
import { ChatComponent } from '../chat/chat.component';
import { IMessage } from '../shared/interfaces/message.interface';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CopySvgComponent,
    ChatSvgComponent,
    ChatComponent,
  ],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomComponent implements OnInit, OnDestroy {
  private readonly callService = inject(CallService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly roomsService = inject(RoomsService);
  private readonly roomMembersService = inject(RoomMembersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly socket = inject(Socket);

  public isCallStarted$!: Observable<boolean>;
  public user!: IUser | null;
  public room!: IRoom | null;
  public messages: IMessage[] = [];

  @ViewChild('localVideo', { static: true })
  public localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true })
  public remoteVideo!: ElementRef<HTMLVideoElement>;

  public isVideoOn = true;
  public isMicroOn = true;
  public isChatOpened = false;

  ngOnInit(): void {
    const roomName = this.activatedRoute.snapshot.params['room'];
    if (!roomName) {
      this.router.navigate([''], {
        relativeTo: this.activatedRoute,
      });
    }

    if (this.authService.isLoggedIn()) {
      this.authService.retrieveUserFromStorage();
    }

    this.usersService.user$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((user) => {
          this.user = user;
          return this.roomsService.getByName(roomName);
        }),
        first()
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((room) => {
        const user = this.usersService.getUser();
        if (user === null || room === null) return;

        this.roomsService.setRoom(room);
        this.roomMembersService
          .createMember(user.id, room.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(async () => {
            this.callService.initPeer(roomName);
            this.socket.emit('join-room', { roomId: room.id, userId: user.id });
          });
      });
    this.roomsService.room$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((room) => (this.room = room));

    this.callService.localStream$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((res) => !!res)
      )
      .subscribe((stream) => {
        this.localVideo.nativeElement.srcObject = stream;
      });
    this.callService.remoteStream$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((res) => !!res)
      )
      .subscribe((stream) => {
        this.remoteVideo.nativeElement.srcObject = stream;
      });

    this.socket
      .fromEvent('messages')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.messages = data;
        this.cdRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.callService.destroyPeer();
    this.callService.closeMediaCall();
    if (this.user === null || this.room === null) return;
  }

  public async onCopyToClipboard(): Promise<void> {
    const roomName = this.activatedRoute.snapshot.params['room'];
    if (roomName) {
      await navigator.clipboard.writeText(roomName);
      alert('Room name copied to clipboard');
    }
  }

  public onShareScreen(): void {
    this.callService.shareScreen();
  }

  public endCall(): void {
    this.callService.closeMediaCall();
    this.router.navigate([''], {
      relativeTo: this.activatedRoute,
    });
  }

  public toggleMicro(): void {
    this.isMicroOn = !this.isMicroOn;
  }

  public toggleVideo(): void {
    this.isVideoOn = !this.isVideoOn;
  }

  public toggleChat(): void {
    this.isChatOpened = !this.isChatOpened;
  }
}
