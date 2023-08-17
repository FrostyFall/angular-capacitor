import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-close-svg',
  templateUrl: './svg.component.svg',
  standalone: true,
})
export class CloseSvgComponent {
  @Input() fillColor = 'white';
}
