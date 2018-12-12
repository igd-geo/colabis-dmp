import { Component, OnInit, OnDestroy, EventEmitter, Output, HostListener } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';

import { Resource } from 'app/resources';

import { BrowserService } from '../../browser.service';

@Component({
  selector: 'new-folder-input',
  styleUrls: [
    './new-folder.style.css'
  ],
  templateUrl: './new-folder.html',
  host: {'(keydown.Escape)': 'close()'}
})
export class NewFolderComponent implements OnInit, OnDestroy {
  @Output() done = new EventEmitter();

  private folder: Observable<Resource> = this._browser.folder;

  // input values
  private name: string;
  private parent: Resource;

  private subscription: Subscription;

  constructor(
    private _browser: BrowserService
  ) { }

  onSubmit() {
    this._browser.createFolder(this.parent.id, this.name);
    this.close(this.name);
  }

  ngOnInit() {
    this.subscription = this.folder.subscribe(s => {
      this.parent = s;
    });
  }

  close(name = null) {
    this.done.emit();
    this.name = '';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
