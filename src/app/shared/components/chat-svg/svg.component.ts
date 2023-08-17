import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-svg',
  templateUrl: './svg.component.svg',
  standalone: true,
})
export class ChatSvgComponent {
  @Input() fillColor = 'white';
}
