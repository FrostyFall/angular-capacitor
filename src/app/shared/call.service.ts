import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import Peer, { MediaConnection, PeerJSOption } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';

import { RoomMembersService } from './room-members.service';
import { RoomsService } from './rooms.service';
import { UsersService } from './users.service';

function timer(time: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => res(), time);
  });
}

@Injectable({
  providedIn: 'root',
})
export class CallService {
  private readonly roomMembersService = inject(RoomMembersService);
  private readonly roomsService = inject(RoomsService);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);
  private peer!: Peer;
  private mediaCall!: MediaConnection;
  private currentPeer!: any;
  public shareSourceId: any = null;
  public sources: any = [];

  private localStreamBs = new BehaviorSubject<MediaStream | null>(null);
  public localStream$ = this.localStreamBs.asObservable();

  private remoteStreamBs = new BehaviorSubject<MediaStream | null>(null);
  public remoteStream$ = this.remoteStreamBs.asObservable();

  public generateUuid(): string {
    return uuidv4();
  }

  public initPeer(peerId: string): void {
    if (!this.peer || this.peer.disconnected) {
      const peerJsOptions: PeerJSOption = {
        debug: 3,
        config: {
          iceServers: [
            {
              urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
              ],
            },
          ],
        },
      };
      const roomId = this.roomsService.getRoom()?.id;

      if (!roomId) return;

      this.roomMembersService
        .getMembers(roomId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(async (members) => {
          const membersNum = members.length;

          let id = null;
          try {
            if (membersNum === 1) {
              id = peerId;
            } else {
              id = uuidv4();
            }
            this.peer = new Peer(id, peerJsOptions);
            await timer(1000);

            await this.enableCallAnswer();
            if (membersNum !== 1) {
              await this.establishMediaCall(peerId);
            }
          } catch (error) {
            console.error(error);
          }
        });
    }
  }

  public async enableCallAnswer(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
        },
        audio: true,
      });
      this.localStreamBs.next(stream);

      this.peer.on('call', (call) => {
        this.mediaCall = call;
        this.mediaCall.answer(stream);

        this.mediaCall.on('stream', (remoteStream) => {
          this.remoteStreamBs.next(remoteStream);
          this.currentPeer = this.mediaCall.peerConnection;
        });
        this.mediaCall.on('error', (err) => {
          console.error(err);
        });
        this.mediaCall.on('close', () => this.onCallClose());
      });
    } catch (ex) {
      console.error(ex);
    }
  }

  public async establishMediaCall(remotePeerId: string): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
        },
        audio: true,
      });

      const connection = this.peer.connect(remotePeerId);
      connection.on('error', (err) => {
        console.error(err);
      });

      this.mediaCall = this.peer.call(remotePeerId, stream);
      if (!this.mediaCall) {
        let errorMessage = 'Unable to connect to remote peer';
        throw new Error(errorMessage);
      }
      this.localStreamBs.next(stream);

      this.mediaCall.on('stream', (remoteStream) => {
        this.remoteStreamBs.next(remoteStream);
        this.currentPeer = this.mediaCall.peerConnection;
      });
      this.mediaCall.on('error', (err) => {
        console.error(err);
      });
      this.mediaCall.on('close', () => this.onCallClose());
    } catch (ex) {
      console.error(ex);
    }
  }

  public async shareScreen(): Promise<void> {
    try {
      const displayMedia = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const videoTrack = displayMedia.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      if (this.localStreamBs.value) {
        this.localStreamBs.value.getVideoTracks()[0];
      }
      const sender = this.currentPeer
        .getSenders()
        .find((s: any) => s.track.kind === videoTrack.kind);
      sender.replaceTrack(videoTrack);
    } catch (err) {
      console.error('Unable to get display media', err);
    }
  }

  private stopScreenShare(): void {
    if (!this.localStreamBs.value) {
      return;
    }
    const videoTrack = this.localStreamBs.value.getVideoTracks()[0];
    const sender = this.currentPeer
      .getSenders()
      .find((s: any) => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
  }

  private onCallClose(): void {
    if (this.remoteStreamBs.value !== null) {
      this.remoteStreamBs.value.getTracks().forEach((track) => {
        track.stop();
      });
    }
    if (this.localStreamBs.value !== null) {
      this.localStreamBs.value.getTracks().forEach((track) => {
        track.stop();
      });
    }
    const user = this.usersService.getUser();
    const room = this.roomsService.getRoom();

    if (user !== null && room !== null) {
      this.roomMembersService
        .removeMember(user.id, room.id)
        .subscribe(() => console.log('User removed'));
    }
  }

  public closeMediaCall(): void {
    this.mediaCall?.close();
    if (!this.mediaCall) {
      this.onCallClose();
    }
  }

  public destroyPeer(): void {
    this.mediaCall?.close();
    this.peer?.disconnect();
    this.peer?.destroy();
  }
}
