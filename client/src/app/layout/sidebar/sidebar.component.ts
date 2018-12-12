import {
    Component, ChangeDetectionStrategy,
    Output, EventEmitter
} from '@angular/core';

@Component({
  selector: 'sidebar',
  styles: [require('./sidebar.css')],
  template: require('./sidebar.html'),
  changeDetection: ChangeDetectionStrategy.OnPush})
export class SidebarComponent {

  expanded = false;
  @Output() expand = new EventEmitter();

  constructor(
  ) {
  }

  public toggle() {
    this.expanded = !this.expanded;
    this.expand.emit(this.expanded);
  }
}
