import { Injectable, inject } from '@angular/core';
import Peer, { MediaConnection, PeerJSOption } from 'peerjs';
import { BehaviorSubject, Subject } from 'rxjs';
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
  private peer!: Peer;
  private mediaCall!: MediaConnection;
  private currentPeer!: any;
  // private peerList: any[] = [];
  private roomMembersService = inject(RoomMembersService);
  private roomsService = inject(RoomsService);
  private usersService = inject(UsersService);

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

      this.roomMembersService.getMembers(roomId).subscribe(async (members) => {
        const membersNum = members.length;
        console.log(membersNum);

        let id = null;
        try {
          if (membersNum === 1) {
            id = peerId;
          } else {
            id = uuidv4();
          }
          this.peer = new Peer(id, peerJsOptions);
          // FIX: DO SOMETHING WITH THIS SHIT
          await timer(1000);

          console.log('Peer ID', id);
          console.log('Room ID', peerId);
          // this.enableCallAnswer();
          // this.establishMediaCall(peerId);
          await this.enableCallAnswer();
          if (membersNum !== 1) {
            await this.establishMediaCall(peerId);
          }
        } catch (error) {
          console.error(error);
        }
      });

      // try {
      //   let id = peerId ?? uuidv4();
      //   this.peer = new Peer(id, peerJsOptions);
      //   return id;
      // } catch (error) {
      //   console.error(error);
      // }
    }
  }

  // Create room
  public async enableCallAnswer() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.localStreamBs.next(stream);

      this.peer.on('call', (call) => {
        // Send local video when other caller calls
        this.mediaCall = call;
        this.mediaCall.answer(stream);

        // Display caller video in #remoteVideo
        this.mediaCall.on('stream', (remoteStream) => {
          console.log('stream');
          // if (!this.peerList.includes(this.mediaCall.peer)) {
          this.remoteStreamBs.next(remoteStream);
          this.currentPeer = this.mediaCall.peerConnection;
          // this.peerList.push(this.mediaCall.peer);
          // }
        });
        this.mediaCall.on('error', (err) => {
          console.error(err);
        });
        this.mediaCall.on('close', () => this.onCallClose());
      });
    } catch (ex) {
      console.log('CREATE ERROR');
      console.error(ex);
    }
  }

  // Join existing room
  public async establishMediaCall(remotePeerId: string) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
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

      // Display caller video in #remoteVideo
      this.mediaCall.on('stream', (remoteStream) => {
        console.log('stream');
        // if (!this.peerList.includes(this.mediaCall.peer)) {
        this.remoteStreamBs.next(remoteStream);
        this.currentPeer = this.mediaCall.peerConnection;
        // this.peerList.push(this.mediaCall.peer);
        // }
      });
      this.mediaCall.on('error', (err) => {
        console.error(err);
      });
      this.mediaCall.on('close', () => this.onCallClose());
    } catch (ex) {
      console.log('JOIN ERROR');
      console.error(ex);
    }
  }

  async shareScreen() {
    try {
      const displayMedia = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      // screen stream
      const videoTrack = displayMedia.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      // this.localStreamBs.value.getVideoTracks()[0] - camera stream
      if (this.localStreamBs.value) {
        this.localStreamBs.value.getVideoTracks()[0];
      }
      // replace sender with screen track
      const sender = this.currentPeer
        .getSenders()
        .find((s: any) => s.track.kind === videoTrack.kind);
      sender.replaceTrack(videoTrack);
    } catch (err) {
      console.log('Unable to get display media ' + err);
    }
  }

  private stopScreenShare() {
    if (!this.localStreamBs.value) {
      return;
    }
    const videoTrack = this.localStreamBs.value.getVideoTracks()[0];
    // replace sender with localStream
    const sender = this.currentPeer
      .getSenders()
      .find((s: any) => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
  }

  private onCallClose() {
    if (this.remoteStreamBs.value !== null) {
      this.remoteStreamBs.value.getTracks().forEach((track) => {
        console.log('remote closing');
        track.stop();
      });
    }
    if (this.localStreamBs.value !== null) {
      this.localStreamBs.value.getTracks().forEach((track) => {
        console.log('local closing');
        track.stop();
      });
    }
    // TODO: remove user
    const user = this.usersService.getUser();
    const room = this.roomsService.getRoom();

    console.log('here =>', user, room);
    if (user !== null && room !== null) {
      this.roomMembersService
        .removeMember(user.id, room.id)
        .subscribe(() => console.log('User removed'));
    }
  }

  public closeMediaCall() {
    this.mediaCall?.close();
    if (!this.mediaCall) {
      this.onCallClose();
    }
  }

  public destroyPeer() {
    this.mediaCall?.close();
    this.peer?.disconnect();
    this.peer?.destroy();
  }
}
