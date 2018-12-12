import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { NotificationsService } from 'angular2-notifications';

import { BrowserService } from 'app/browser';

// Model
import { Resource } from 'app/resources';
import { Publication, PublicationService } from 'app/publications';

/**
 * Allow to publish a file
 */
@Component({
  selector: 'resource-publish',
  styleUrls: [
    './info.css'
  ],
  templateUrl: './publish.html'
})
export class PublishComponent implements OnChanges {
  @Input() resource: Resource;

  @ViewChild('datasetInput')
  datasetInput: ElementRef;

  @ViewChild('organisationInput')
  organisationInput: ElementRef;

  dataset: string = '';
  organisation: string = '';

  publication: Observable<Publication[]>;

  constructor(
    private browser: BrowserService,
    private service: PublicationService,
    private notification: NotificationsService
  ) { }

  ngOnChanges() {
    if (this.resource) {
      this.dataset = this.resource.name;
      this.organisation = this.resource.properties['Organisation'] || 'Unknown Organisation';

      this.organisationInput.nativeElement.innerText = this.organisation;
      this.datasetInput.nativeElement.innerText = this.dataset;

      this.publication = this.service.getPublications(this.resource);
    }
  }

  datasetChanged(event) {
    this.dataset = event.target.innerText.trim();
  }

  organisationChanged(event) {
    this.organisation = event.target.innerText.trim();
  }

  publish() {
    this.service.publish(this.dataset, this.organisation, this.resource)
      .subscribe(
        p => {
         this.notification.success('Published', 'Successfully published ' + this.resource.name);
         this.browser.refreshFolder();
        },
        err => this.notification.error('Publication Error', err));
  }

  unpublish(publication: Publication) {
    this.service.unpublish(this.resource)
      .subscribe(
        p => {
         this.notification.success('Unpublished', 'Successfully unpublished ' + this.resource.name);
         this.browser.refreshFolder();
        },
        err => this.notification.error('Failed to remove publication', err));
  }
}
