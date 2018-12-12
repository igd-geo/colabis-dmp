import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { ActionMenuService } from '../actions';
import { BrowserService } from '../';

/**
 * Display all file information
 */
@Component({
  selector: 'file-navbar',
  styleUrls: [
    './navbar.style.css'
  ],
  templateUrl: './navbar.html'
})
export class NavbarComponent {

  private createFolder: boolean;
  private uploadFile: boolean = false;
  private importProvXML: boolean = false;

  constructor(
    private menu: ActionMenuService,
    private browser: BrowserService,
    private element: ElementRef
  ) { }

  private showMenu() {
    let el = this.element.nativeElement.firstElementChild;
    console.log(this.element);
    console.log(el.offsetLeft, el.offsetTop);

    let x = el.offsetLeft + el.clientWidth;
    let y = el.offsetTop + el.clientHeight;
    this.browser.selected.first().subscribe(
      s => this.menu.show([s], {
        clickToClose: true,
        x: x,
        y: y,
        pos: 'bottom-right',
        preventflip: true
      })
    );
  }
}
