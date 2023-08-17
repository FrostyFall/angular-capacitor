import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMessage } from '../shared/interfaces/message.interface';
import { SendSvgComponent } from '../shared/components/send-svg/svg.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Socket } from 'ngx-socket-io';
import { IRoom } from '../shared/interfaces/room.interface';
import { IUser } from '../shared/interfaces/user.interface';
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
export class ChatComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input('messages') messages: IMessage[] = [];
  @Input('room') room: IRoom | null = null;
  @Input('user') user: IUser | null = null;
  @Output('toggleChat') toggleChat = new EventEmitter();
  cdRef = inject(ChangeDetectorRef);

  private fb = inject(FormBuilder);
  private socket = inject(Socket);

  form!: FormGroup;

  @ViewChild('main') main!: ElementRef<HTMLDivElement>;

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes['messages']);
  }

  ngOnInit(): void {
    this.form = this.fb.group({ message: ['', Validators.required] });
  }

  ngAfterViewChecked(): void {
    this.main.nativeElement.scrollTop = this.main.nativeElement.scrollHeight;
  }

  onToggleChat(e: Event) {
    e.stopPropagation();
    this.toggleChat.emit();
  }

  onSubmit() {
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

  msgIdentify(index: number, item: IMessage) {
    return item.id;
  }
}
