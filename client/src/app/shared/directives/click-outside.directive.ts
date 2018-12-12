import { Directive, ElementRef, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[click-outside]'
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  @Output('click-outside') clickOutside: EventEmitter<Event> = new EventEmitter();

  constructor (
    public element: ElementRef
  ) { }

  ngOnInit() {
    setTimeout(() => {
      document.addEventListener('click', e => this.onClick(e));
    }, 0);
  }

  ngOnDestroy() {
    document.removeEventListener('click', e => this.onClick(e));
  }

  onClick(event) {
    let target = event.target;
    let inside = false;
    do {
      if (target === this.element.nativeElement) {
        inside = true;
      }
      target = target.parentNode;
    } while (target && !inside);
    if (!inside) {
      this.clickOutside.emit(event);
    }
  }
}
