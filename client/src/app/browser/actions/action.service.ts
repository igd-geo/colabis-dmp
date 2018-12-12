import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';

import { Resource } from 'app/resources';

import { MenuEvent } from './menuevent.type';
import { Options } from './options.type';

@Injectable()
export class ActionMenuService {

  private _emitter: Subject<MenuEvent> = new Subject<MenuEvent>();

  get onEvent(): Observable<MenuEvent> {
    return this._emitter;
  }

  get onShow(): Observable<MenuEvent> {
    return this.onEvent.filter(e => e.action === 'show');
  }

  get onHide(): Observable<MenuEvent> {
    return this.onEvent.filter(e => e.action === 'hide');
  }

  show(selection?: Resource[], override?: Options) {
    this._emitter.next({action: 'show', selection: selection, options: override});
  }

  hide(override?: Options) {
    this._emitter.next({action: 'hide'});
  }
}
