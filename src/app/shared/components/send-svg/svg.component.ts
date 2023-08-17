import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-send-svg',
  templateUrl: './svg.component.svg',
  standalone: true,
})
export class SendSvgComponent {
  @Input() fillColor = 'white';
}
