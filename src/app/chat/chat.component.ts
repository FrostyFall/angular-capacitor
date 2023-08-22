import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Socket } from 'ngx-socket-io';

import { IMessage } from '../shared/interfaces/message.interface';
import { IRoom } from '../shared/interfaces/room.interface';
import { IUser } from '../shared/interfaces/user.interface';
import { SendSvgComponent } from '../shared/components/send-svg/svg.component';
import { CloseSvgComponent } from '../shared/components/close-svg/svg.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SendSvgComponent,
    CloseSvgComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, AfterViewChecked {
  private readonly fb = inject(FormBuilder);
  private readonly socket = inject(Socket);

  @Input('messages') public messages: IMessage[] = [];
  @Input('room') public room: IRoom | null = null;
  @Input('user') public user: IUser | null = null;
  @Output('toggleChat') public toggleChat = new EventEmitter();

  public form!: FormGroup;

  @ViewChild('main') public main!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.form = this.fb.group({ message: ['', Validators.required] });
  }

  ngAfterViewChecked(): void {
    this.main.nativeElement.scrollTop = this.main.nativeElement.scrollHeight;
  }

  public onToggleChat(e: Event): void {
    e.stopPropagation();
    this.toggleChat.emit();
  }

  public onSubmit(): void {
    if (this.user === null || this.room === null) return;

    const message = this.form.getRawValue().message;

    const messageBody = {
      message,
      userId: this.user.id,
      roomId: this.room.id,
    };

    this.socket.emit('add-user-message', messageBody);
    this.form.reset();
  }

  public msgIdentify(_: number, item: IMessage): number {
    return item.id;
  }
}
