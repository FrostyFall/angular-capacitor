import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Socket, SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { BrowserModule } from '@angular/platform-browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, MatSnackBarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  socket: Socket = inject(Socket);

  title = 'zoom-clone';
  messages$!: Observable<any>;
  users$!: Observable<any>;

  ngOnInit(): void {
    // this.socket
    //   .fromEvent('user-connected')
    //   .subscribe((value) => console.log('dick => ', value));
    // // this.socket.fromEvent()
    // this.messages$ = this.socket.fromEvent('messages');
    // this.socket
    //   .fromEvent('user-connected')
    //   .subscribe((value: any) =>
    //     console.log(`user ${value.userId} joined this room`)
    //   );
  }

  handleJoinRoom() {
    const roomId = 'dsadweqe-ddsasdads';
    const userId = 2;

    this.socket.emit('join-room', { roomId, userId });
  }

  handleSendMessage() {
    this.socket.emit('message', { msg: 'hui' });
  }
}
