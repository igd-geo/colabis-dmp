import { Component, OnChanges, Input } from '@angular/core';
import { BrowserService } from '../browser.service';
import { Resource } from 'app/resources';
import { QualificationService } from 'app/qualification';
import { Property, EditData } from './utils'

@Component({
	selector: 'resource-extras',
	styleUrls: [
    './info.css', 
    './extras.css'
  ],
	templateUrl: './extras.html'
})
export class ExtrasComponent implements OnChanges {
	@Input() resource: Resource;

  private extras = [];
  private showMissing: boolean = false;
  private modalVisible: boolean = false;
  private editable: boolean = false;

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
          .filter(k => missing[k].multiline)
          .filter(k => this.resource.mimetype == this._qualification.getMimetype(k))
          .map(k => new Property(k, null, true, missing[k].description, missing[k].example));

      this.extras =
        Object.keys(this.resource.extras)
          .map(k => new Property(k,
              this.resource.extras[k],
              !error[k],
              error[k] && error[k].message ? error[k].message : this._qualification.getDescription(k),
              this._qualification.getExample(k)))
          .concat(unavailable);

      this.reset();
    } else {
      this.extras = [];
    }
  }

  /**
   * Reset the editing
   */
  reset() {
    this.editdata = null;
  }  

  /**
   * Create a new property   
   */
  create() {
    this.editable = true;
    this.editdata = new EditData();
    this.modalVisible = true;
  }

  /**
   * Open a modal dialog to show the whole property value with editing disabled.
   */
  show(property: Property) {
    this.editdata = new EditData(property);
    this.editable = false;
    this.modalVisible = true;
  }

  /**
   * Open a modal dialog to edit an existing property.
   * @param {Property} property - The property
   */
  edit(property: Property) {
    this.editdata = new EditData(property);
    this.editable = true;
    this.modalVisible = true;
  }


  /**
   * Remove a property
   * @param {Property} property - The property
   */
  remove(property: Property) {
    delete this.resource.extras[property.key];
    this._browser.modifyResource(this.resource);
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
   * Save the currently edited data and update the resource
   * accordingly.
   */
  save() {
    if (!this.isNew() && this.editdata.key !== this.editdata.property.key) {
      delete this.resource.extras[this.editdata.property.key];
    }
    this.resource.extras[this.editdata.key] = this.editdata.value;
    this._browser.modifyResource(this.resource);
    this.reset();
  }
}