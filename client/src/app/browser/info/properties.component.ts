import { Component, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Rx';

// Model
import { Resource } from 'app/resources';
import { BrowserService } from '../browser.service';
import { QualificationService } from 'app/qualification';
import { Property, EditData } from './utils';

/**
 * Display all file information
 */
@Component({
  selector: 'resource-properties',
  styleUrls: [
    './info.css',
    './properties.css'
  ],
  templateUrl: './properties.html'
})
export class PropertiesComponent implements OnChanges {
  @Input() resource: Resource;

  private showMissing: boolean = false;
  private properties = [];

  // new property
  private editdata: EditData;

  constructor(
      private _browser: BrowserService,
      private _qualification: QualificationService
  ) { }

  ngOnChanges() {
    if (this.resource) {
      let error = this._qualification.error(this.resource);
      let missing = this._qualification.unavailable(this.resource);

      let unavailable = Object.keys(missing)
          .filter(k => !missing[k].multiline)
          .map(k => new Property(k, null, true, missing[k].description, missing[k].example, this._qualification.getRequired(k)));
      this.properties =
        Object.keys(this.resource.properties)
          .map(k => new Property(k,
              this.resource.properties[k],
              !error[k],
              error[k] && error[k].message ? error[k].message : this._qualification.getDescription(k),
              this._qualification.getExample(k),
              this._qualification.getRequired(k)))
          .concat(unavailable);

      this.reset();
    } else {
      this.properties = [];
    }
  }

  /**
   * Check if a given property is currently beeing edited.
   * If no property is provided, this will check if any editing is done
   * at the moment.
   * @param {Property} property - Property
   */
  editing(property = null) {
    if (!this.editdata)
      return false;
    return property == null ||
        this.editdata.property === property;
  }

  /**
   * Check if the current editing is creating a new property
   */
  isNew() {
    return this.editing() && !this.editdata.property;
  }

  /**
   * Reset the editing
   */
  reset() {
    this.editdata = null;
  }

  /**
   * Remove a property
   * @param {Property} property - The property
   */
  remove(property: Property) {
    delete this.resource.properties[property.key];
    this._browser.modifyResource(this.resource);
  }

  /**
   * Create a new property   
   */
  create() {
    this.editdata = new EditData();
  }


  /**
   * Edit an existing property
   * @param {Property} property - The property
   */
  edit(property: Property) {
    this.editdata = new EditData(property);
  }

  /**
   * Save the currently edited data and update the resource
   * accordingly.
   */
  save() {
    if (!this.isNew() && this.editdata.key !== this.editdata.property.key) {
      delete this.resource.properties[this.editdata.property.key];
    }
    this.resource.properties[this.editdata.key] = this.editdata.value;
    this._browser.modifyResource(this.resource);
    this.reset();
  }

  /**
   * Change key of the property currently being edited
   */
  keyChanged(event) {
    this.editdata.key = event.target.innerText.trim();
  }

  /**
   * Change value of the property currently being edited
   */
  valueChanged(event) {
    this.editdata.value = event.target.innerText.trim();
  }
}
