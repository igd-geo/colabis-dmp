import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Resource } from 'app/resources';
import { Workflow, Entity } from 'app/workflow'

import { BrowserService } from '../.';
/**
 * Display all file information
 */
@Component({
  selector: 'resource-details',
  styleUrls: [
    './info.css'
  ],
  templateUrl: './details.html'
})
export class DetailsComponent implements OnInit {
  @Input() resource: Resource;

  public workflow: Observable<Workflow> = this._browser.workflow;
  public entity: Observable<Entity> = this._browser.entity;

  public modal: UIkit.ModalElement;

  constructor(
    private _browser: BrowserService
  ) { }

  public showWorkflow() {
    this.modal.show();
  }

  public ngOnInit() {
    this.modal = UIkit.modal('#provxml-modal');
  }
}
