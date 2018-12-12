import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { BrowserService } from 'app/browser';
import { Resource } from 'app/resources';
import { QualificationService } from 'app/qualification';

/**
 * Display all resource information
 */
@Component({
  selector: 'resource-information',
  styleUrls: [
    './info.css'
  ],
  templateUrl: './info.html'
})
export class ResourceInfoComponent {
  resource: Observable<Resource>;

  constructor(
      private browser: BrowserService,
      private qualification: QualificationService
  ) {
    this.resource = this.browser.selected
        .filter(s => !!s)
        .map(r => qualification.qualify(r));
  }
}
