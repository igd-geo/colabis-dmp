import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { TagInputComponent } from 'ng2-tag-input';
// Model
import { Resource } from 'app/resources';
import { BrowserService } from '../browser.service';

/**
 * Display all file information
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@Component({
  selector: 'resource-tags',
  styleUrls: [
    './info.css',
    './tags.style.css'
  ],
  templateUrl: './tags.html'
})
/**
 * Class representing TagsComponent.
 * @implements {OnChanges}
 */
export class TagsComponent implements OnChanges {
  @Input() resource: Resource;
  tags: any[] = [];

  private selected = this._browser.selected;

  @ViewChild(TagInputComponent)
  private tagInput: TagInputComponent;

  /**
   * Create a TagsComponent.
   * @param {BrowserService} _browser - The browser service object.
   */
  constructor (
      private _browser: BrowserService
  ) { }

  /**
   * method called on angular component change i.e. interaction with the DMP application
   */
  ngOnChanges() {
    if (this.resource) {
      this.tags = this.resource.tags;
    } else {
      this.tags = [];
    }
  }

  /**
   * saves the tag
   */
  onSave() {
    this.resource.tags = this.tags.map(t => t === Object(t) ? t.value : t);
    this._browser.modifyResource(this.resource);
  }

  /**
   * adds the tag item
   */
  addTagItem() {
    this.tagInput.addItem(false);
  }

  /**
   * discards the tag input
   */
  discardTagInput() {
    this.tagInput.setInputValue(null);
  }
}
