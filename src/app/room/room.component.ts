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
import {
  Observable,
  combineLatest,
  combineLatestAll,
  filter,
  first,
  switchMap,
} from 'rxjs';
import { CallService } from '../shared/call.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterModule,
} from '@angular/router';
import { UsersService } from '../shared/users.service';
import { IUser } from '../shared/interfaces/user.interface';
import { Socket } from 'ngx-socket-io';
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
  private callService = inject(CallService);
  private activatedRoute = inject(ActivatedRoute);
  private usersService = inject(UsersService);
  private roomsService = inject(RoomsService);
  private roomMembersService = inject(RoomMembersService);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private cdRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private socket = inject(Socket);

  public isCallStarted$!: Observable<boolean>;
  public user!: IUser | null;
  public room!: IRoom | null;

  messages: IMessage[] = [];

  @ViewChild('localVideo', { static: true })
  localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true })
  remoteVideo!: ElementRef<HTMLVideoElement>;

  isVideoOn = true;
  isMicroOn = true;
  isChatOpened = false;

  ngOnInit() {
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

    // SOCKET.IO
    this.socket
      .fromEvent('messages')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        console.log('Received Messages', data);
        this.messages = data;
        this.cdRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.callService.destroyPeer();
    this.callService.closeMediaCall();
    if (this.user === null || this.room === null) return;
    // this.roomMembersService
    //   .removeMember(this.user.id, this.room.id)
    //   .subscribe();
  }

  async onCopyToClipboard() {
    const roomName = this.activatedRoute.snapshot.params['room'];
    if (roomName) {
      await navigator.clipboard.writeText(roomName);
      alert('Room name copied to clipboard');
    }
  }

  onShareScreen() {
    this.callService.shareScreen();
  }

  public endCall() {
    // TODO: delete room member from db
    this.callService.closeMediaCall();
    this.router.navigate([''], {
      relativeTo: this.activatedRoute,
    });
  }

  toggleMicro() {
    this.isMicroOn = !this.isMicroOn;
  }

  toggleVideo() {
    this.isVideoOn = !this.isVideoOn;
  }

  toggleChat() {
    this.isChatOpened = !this.isChatOpened;
  }
}
