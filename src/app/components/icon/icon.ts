import { Component, input } from '@angular/core';

export type IconType = 'calendar' | 'view' | 'edit' | 'delete' | 'status' | 'add' | 'return' | 'cancel';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss'
})
export class Icon {
  type = input.required<IconType>();

  get iconPath(): string {
    switch (this.type()) {
      case 'calendar':
        return 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z';
      case 'view':
        return 'M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z';
      case 'edit':
        return 'M3 17.2V21h3.8L17.8 9.9l-3.8-3.8L3 17.2zM20.7 7c.4-.4.4-1 0-1.4l-2.3-2.3c-.4-.4-1-.4-1.4 0l-1.8 1.8 3.8 3.8 1.7-1.9z';
      case 'delete':
        return 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z';
      case 'add':
        return 'M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z';
      case 'return':
        return 'M10 9V5l-7 7 7 7v-4h4.5c2.5 0 4.5 2 4.5 4.5V21h2v-1.5c0-3.6-2.9-6.5-6.5-6.5H10z';
      case 'cancel':
        return 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
      default:
        return '';
    }
  }
}
