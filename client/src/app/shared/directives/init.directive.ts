import { Directive, ElementRef, Input, Renderer, OnInit } from '@angular/core';

@Directive({
  selector: '[init]'
})
export class InitDirective implements OnInit {
  @Input() init: string;

  constructor(
    private element: ElementRef,
    private renderer: Renderer
  ) { }

  ngOnInit() {
    this.renderer.setText(this.element.nativeElement, this.init);
  }
}
