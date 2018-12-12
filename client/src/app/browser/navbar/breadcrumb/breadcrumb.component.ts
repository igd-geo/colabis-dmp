import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { BrowserService } from '../../browser.service';

import { Resource } from 'app/resources';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'breadcrumb',
  styles : [require('./breadcrumb.css')],
  template : require('./breadcrumb.html'),
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbComponent {

  private folder: Observable<Resource> = this._browser.folder;
  private parents: Observable<Resource[]> = this._browser.parents;

  constructor(
    private _browser: BrowserService
  ) { }

  openFolder(id: string) {
    this._browser.changeFolder(id);
  }
}
