import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-copy-svg',
  templateUrl: './svg.component.svg',
  standalone: true,
})
export class CopySvgComponent {
  @Input() fillColor = 'white';
}
