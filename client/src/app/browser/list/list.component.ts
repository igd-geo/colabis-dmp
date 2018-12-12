import {
  Component, ElementRef, EventEmitter, Input,
  Output, OnInit, OnDestroy, ViewChild
} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';

// datatable
import { DatatableComponent } from '@swimlane/ngx-datatable';
import '@swimlane/ngx-datatable/release/datatable.css';

// Services
import { BrowserService } from '../browser.service';
import { QualificationService } from '../../qualification';
import { ActionMenuService } from '../actions';

import { Resource } from 'app/resources';
import { AuthenticationService } from 'app/auth';


@Component({
  selector: 'resource-list',
  styleUrls: [
    './list.css'
  ],
  templateUrl: './list.html'
})
export class ResourceListComponent implements OnInit, OnDestroy {
  /**
   * The group to display children from
   */
  @Input() set parent(p: Resource) {
    this._clearSubscription('folder');

    if (!p) {
      this._useCurrentFolder();
      return;
    }
    this._parent = p;
    this._subscribeChildren(this.browser.getChildren(p.id));
  }

  get parent(): Resource {
    return this._parent;
  }

  /**
   * The selected resources
   */
  @Input() set selected(selected: Resource[]) {
    selected = selected || [];
    this._selected = selected;

    // include each row which is the parent of a selected resource
    let rows = this.table.rows || [];
    let parents = rows.filter(r =>
        selected.some(s => r.id === s.parent));
    this._selected.push(...parents);

    // set selected rows
    this._updateSelectedRows();
  }

  /**
   * Get selected resources
   */
  get selected(): Resource[] {
    return this._selected;
  }

  /**
   * The the selection of this list
   */
  get selection(): Resource[] {
    return this.selected
      .filter(row => !this.selected.some(other => other.parent === row.id));
  }

  /**
   * Selection event
   */
  @Output() selectedChange: EventEmitter<Resource[]> = new EventEmitter();

  /**
   * Currently edited resource id
   */
  @Input() edit: Resource;

  /**
   * Edit event
   */
  @Output() editChange: EventEmitter<any> = new EventEmitter();

  @ViewChild(DatatableComponent)
  private table: DatatableComponent;

  private _children: Observable<Resource[]>;
  private _parent: Resource;
  private _selected: Resource[] = [];
  private _subscriptions: any = {};


  private dropdown: any;

  /**
   * Constructor
   */
  constructor(
    private auth: AuthenticationService,
    private browser: BrowserService,
    private qualification: QualificationService,
    private menu: ActionMenuService
  ) { }

  ngOnInit() {
    if (!this.parent) {
      this._useCurrentFolder();
    }
  }

  ngOnDestroy() {
    this._clearSubscription();
  }

  /**
   * On row activation
   * @param event Row activation event data
   */
  onActivate(event) {
    if (event.type === 'dblclick') {
      if (event.row.is_folder) {
        this.openFolder(event.row);
      } else if (event.row.is_group) {
        this.table.toggleExpandRow(event.row);
      } else {
        this.download(event.row);
      }
    }
  }

  /**
   * On row selection
   * @param event Selection event data
   */
  onSelect(event) {
    if (!event.selected) return false;

    this._selected = event.selected ? event.selected : [];
    if (this.selection.length === 1) {
      let id = this.selection[0].id;
      this._select(id);
    } else {
      this._select(this.parent.id);
    }

    this.selectedChange.emit(this.selected);
  }

  /**
   * On context menu
   */
  onContextMenu(event) {
    console.log(event.row.id);
    if (!this.selected.some(s => s === event.row)) {
      // element is not selected yet
      this.selected = [event.row];
      this._select(event.row.id);

      this.selectedChange.emit([event.row]);
    }
    if (!this.parent.is_group) {
      // show context on top level only
      this.menu.show(this.selection, {
        x: event.event.clientX,
        y: event.event.clientY
      });
      event.event.preventDefault();
      event.event.stopPropagation();
    }
  }

  /**
   * Test if a given row is selected. If `exclusive` is set, it only
   * returns true if `row` is the only selected row
   * @param [any] row - The row
   * @param [boolean] exclusive - The only selected row
   */
  isSelected(row: any, exclusive: boolean = false): boolean {
    if (!this.table.selected.some(r => r === row)) return false;
    if (exclusive) {
      return this.table.selected.length === 1;
    }
    return true;
  }

  /**
   * Open the folder specified by `resource`, if it is a folder
   * @param {Resource} resource - The resource
   */
  openFolder(resource: Resource) {
    if (resource.is_folder) {
      this.browser.changeFolder(resource.id);
    }
  }

  /**
   * Download the file associated to `resource`
   * @param {Resource} resource - The resource
   */
  download(resource: Resource): boolean {
    this.auth.token.take(1).subscribe(t =>
      window.location.assign(resource.download_url + '?access_token=' + t)
    );
    return false;
  }

  private _updateSelectedRows() {
    this.table.selected = (this.table.rows || [])
        .filter(r => this.selected.some(s => r.id === s.id));
    // expand all groups which contain a selected child
    this.table.selected
        .filter(s => s.is_group)
        .filter(s => this.selected.some(other => s.id === other.parent))
        .filter(s => s.$$expanded !== 1)
        .forEach(s => this.table.toggleExpandRow(s));
  }

  private _subscribeChildren(children: Observable<Resource[]>) {
    this._clearSubscription('children');
    this._subscriptions['children'] = children
      .map(c => c.map(child => this.qualification.qualify(child)))
      .subscribe(c => {
        this.table.rows = c;
        this._updateSelectedRows();
      });
  }

  private _clearSubscription(id?: string) {
    if (!id) {
      Object.keys(this._subscriptions).forEach(k =>
        this._clearSubscription(k)
      );
    } else if (this._subscriptions[id]) {
      this._subscriptions[id].unsubscribe();
      this._subscriptions[id] = undefined;
    }
  }

  private _useCurrentFolder() {
    this._subscriptions['folder'] = this.browser.folder
        .first()
        .subscribe(f => this._parent = f);
    this._subscribeChildren(this.browser.children);
  }

  /**
   * Select the specified resource if not selected yet
   * @param {string} id - The resource id
   */
  private _select(id: string) {
    this.browser.selected.firstIf(r => r.id !== id).subscribe(() =>
      this.browser.selectResource(id)
    );
  }
}
