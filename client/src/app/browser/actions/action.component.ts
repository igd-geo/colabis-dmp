import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding,
    Input, OnChanges, OnDestroy, OnInit
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Resource } from '../../resources';
import { AuthenticationService } from '../../auth';
import { BrowserService } from '../../browser';

import { ActionMenuService } from './action.service';
import { Options } from './options.type';
import { Entries } from './entries.type';

/**
 * Default Options
 */
const DEFAULT_OPTIONS: Options = {
  clickToClose: false,
  x: 0,
  y: 0,
  pos: 'bottom-left',
  preventflip: false
};

/**
 * The ActionMenuComponent displays a dropdown menu
 * with available resource commands
 */
@Component({
  selector: 'action-menu',
  styleUrls: [ 'action.component.css' ],
  templateUrl: 'action.component.html',
  host: {
    '[style.position]': '"absolute"',
    '[style.left]': '_currentOptions.x + "px"',
    '[style.top]': '_currentOptions.y + "px"'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionMenuComponent implements OnChanges, OnDestroy, OnInit {

  @Input() selection: Resource[] = [];
  @Input() set options(opts: Options) {
    this._options = opts;
  }

  private dropdown: UIkit.DropdownElement;
  private entries: Entries = {};
  private action: 'rename' | 'move' | 'group' | 'addToGroup';

  private _options: Options;
  private _currentOptions: Options = DEFAULT_OPTIONS;

  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthenticationService,
    private browser: BrowserService,
    private service: ActionMenuService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // subscribe to show events and prepare view data
    this.subscriptions['show'] = this.service.onShow.subscribe(e => {
      this.selection = e.selection || [];
      this.show(e.options);
    });

    // subscribe to hide eventes
    this.subscriptions['hide'] = this.service.onHide.subscribe(e => {
      this.hide();
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s =>
      s.unsubscribe()
    );
  }

  ngOnChanges() {
    this.selection = this.selection || [];
    this.updateEntries();
  }

  /**
   * Show the dropdown menu
   */
  public show(override?: Options) {
    this.prepareDropdown(override);
    this.updateEntries();
    this.resetActions();
    this.dropdown.show();
  }

  /**
   * Hide the dropdown menu
   */
  public hide() {
    this.dropdown.hide();
  }

  /**
   * Prepare the dropdown component.
   * This merges the default options, options given by input and
   * potential overrides and creates the dropdown component accordingly.
   * @param {Options} [override] - Options to override
   */
  private prepareDropdown(override?: Options) {
    // Prepare options
    let opts = Object.assign({}, DEFAULT_OPTIONS, this._options, override);
    let changed = Object.keys(opts).some(k => opts[k] !== this._currentOptions[k]);

    // everything up to date
    if (this.dropdown && !changed) {
      return;
    }

    // clear existing dropdown instance
    if (this.dropdown) {
      $('.action-menu').data('dropdown', null);
      $('.action-menu').off();
    }

    // create the dropdown component
    this._currentOptions = opts;
    this.dropdown = UIkit.dropdown('.action-menu', {
      mode: opts.clickToClose ? 'click' : 'hover',
      pos: opts.pos,
      preventflip: opts.preventflip
    });
  }

  /**
   * Update the visibility of the menu entries
   */
  private updateEntries() {
    this.entries = {};

    this.entries.rename = this.selection.length === 1;
    this.entries.delete = this.selection.length > 0;
    this.entries.move = this.selection.length > 0;
    this.entries.download = this.selection.length === 1 &&
        !this.selection[0].is_folder &&
        !this.selection[0].is_group;
    this.entries.downloadAsZip = this.selection.length === 1 && 
        (this.selection[0].is_folder || this.selection[0].is_group);

    if (this.selection.length > 0) {
      let parent = this.selection[0].parent;
      // check if same parent, no group and no folder
      if (this.selection.every(s =>
          s.parent === parent && !s.is_group && !s.is_folder)) {
        this.browser.getResource(parent)
          .first()
          .subscribe(p => {
            this.entries.group = !p.is_group;
            this.entries.addToGroup = !p.is_group &&
                this.selection.every(s => !s.is_folder && !s.is_group);
            this.entries.removeFromGroup = p.is_group;

            this.changeDetector.markForCheck();
          });
      }
    }
    this.changeDetector.markForCheck();
  }

  /**
   * Dismiss any action
   */
  private resetActions() {
    this.action = null;
  }

  /**
   * Start renaming the current resource
   */
  private rename(): void {
    this.action = 'rename';
  }

  /**
   * Check if renaming is done at the moment
   */
  private renaming(): boolean {
    return this.action === 'rename';
  }

  /**
   * Rename the selected resources.
   * @param {string} name - The new resource name
   */
  private onRename(name: string): void {
    let result = Object.assign({}, this.selection[0], {name: name});
    this.browser.modifyResource(result);
    this.hide();
  }

  /**
   * Delete the currently selected resources.
   * Before deleting the resource, the user will be asked for confirmation.
   */
  private delete(): void {
    let items = this.selection;
    let msg = 'Do you really want to remove the selected resources?';
    UIkit.modal.confirm(msg,
      () => items.forEach(r => this.browser.removeResource(r.id)),
      { center: true }
    );
    this.hide();
  }

  /**
   * Start moving the current resource
   */
  private move(): void {
    this.action = 'move';
  }

  /**
   * Check if moving is done at the moment
   */
  private moving(): boolean {
    return this.action === 'move';
  }

  /**
   * Move the selected resources to a different folder.
   * Before moving the resource, the user will be asked for confirmation.
   * @param {string} id - The ID of the target folder (i.e. resource)
   */
  private onMove(id: String): void {
    // TODO: Needs to be implemented
  }

  /**
   * Download the currently selected resource.
   */
  private download(): void {
    let resource = this.selection[0];
    this.auth.token.take(1).subscribe(t =>
      window.location.assign(resource.download_url + '?access_token=' + t)
    );
    this.hide();
  }

  /** 
   * Download the currently selected folder as zip file. 
   */ 
  private downloadAsZip(): void { 
    let resource = this.selection[0]; 
    this.auth.token.take(1).subscribe(t =>  
      window.location.assign(resource.download_url
        + '?access_token=' + t 
        + '&format=archive') 
    ); 
    this.hide(); 
  } 

  /**
   * Start grouping the current resource
   */
  private group(): void {
    this.action = 'group';
  }

  /**
   * Check if renaming is done at the moment
   */
  private grouping(): boolean {
    return this.action === 'group';
  }

  /**
   * Create a new group and add the currently selected resources
   * @param {string} name - The name of the new group
   */
  private onGroup(name: string): void {
    this.browser.createGroup(name, this.selection);
    this.hide();
  }

  /**
   * Start moving the current resource
   */
  private addToGroup(): void {
    this.action = 'addToGroup';
  }

  /**
   * Check if moving is done at the moment
   */
  private addingToGroup(): boolean {
    return this.action === 'addToGroup';
  }


  /**
   * Add the selected resources to an existing group.
   * @param {string} id - The ID of the target group (i.e. resource)
   */
  private OnAddToGroup(id: string): void {
    // TODO: Needs to be implemented
  }

  /**
   * Remove the currently selected resources from its group.
   * In particular, this will move each resource to the current folder
   */
  private removeFromGroup(): void {
    let items = this.selection;

    this.browser.folder.take(1).subscribe(p =>
      items.forEach(r => this.browser.moveResource(r, p.id)));
    this.hide();
  }

}
