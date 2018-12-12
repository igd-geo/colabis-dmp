import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Rx';

import { BrowserService } from './browser.service';

// Directives

@Component({
  selector: 'browser',
  styleUrls : [
    './browser.css'
  ],
  templateUrl: './browser.html',
})
export class BrowserComponent implements OnInit {

  private _subscription: Subscription;

  private folder = this._browser.folder;
  private selected = this._browser.selected;

  constructor(
    private _browser: BrowserService,
    private _route: ActivatedRoute,
  ) {
    console.log('Create Browser');
  }

  ngOnInit() {
    console.log('FileBrowserComponent::ngOnInit');
    this._subscription = this._route.params.subscribe(params => {
      let id = params['id'] || 'root';
      this._browser.changeFolder(id, false);
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  selectFolder() {
    this.folder.take(1).subscribe(f =>
      this._browser.selectResource(f.id)
    );
  }
}
