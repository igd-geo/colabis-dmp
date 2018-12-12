import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[focus]'
})
export class FocusDirective implements OnChanges {
  @Input() focus: boolean;

  constructor(
    private element: ElementRef
  ) { }

  public ngOnChanges() {
    if (this.focus) {
      this.element.nativeElement.focus();
    }
  }
}
