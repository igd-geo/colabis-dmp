import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output
} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';

import { NotificationsService, SimpleNotificationsComponent } from 'angular2-notifications';

import { StateStore } from 'app/state';
import { BrowserService } from 'app/browser';
import { Resource } from 'app/resources';
import { ProvXML, CreateWorkflow } from 'app/workflow';

@Component({
  selector: 'workflow-dialog',
  styles: [
    require('./workflow.dialog.css')
  ],
  template: require('./workflow.dialog.html')
})
export class WorkflowDialog implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter();

  private modal: UIkit.ModalElement;

  private file: File = null;

  private workflowName: string = "";
  private provXML: ProvXML;

  private subscription: Subscription;
  private parent: Resource;

  constructor(
    private _store: StateStore,
    private _browser: BrowserService,
    private _notifications: NotificationsService,
  ) { }

  ngOnInit() {
    this.subscription = this._browser.folder.subscribe(s => {
      this.parent = s;
    });
    this.modal = UIkit.modal('#workflow-modal');
    $('#workflow-modal').on({
      'hide.uk.modal': (e) => {
        this.visibleChange.emit(false);
      }
    });
    // Initialise drop area
    let self = this;
    let drop = $('#workflow-drop');
    drop.on({
      'drop': e => {
        if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files) {
            e.stopPropagation();
            e.preventDefault();

            drop.removeClass('uk-dragover');
            this.onFilesChanged(e.originalEvent.dataTransfer.files);
        }
      },
      'dragenter dragover dragleave': e => {
        e.stopPropagation();
        e.preventDefault();
      },
      'dragover': e => {
        if (e.originalEvent.dataTransfer.items.length == 1) {
          drop.addClass('uk-dragover');
        }
      },
      'dragleave': e => {
        drop.removeClass('uk-dragover');
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: any) {
    this.file = null;
    this._showModal(this.visible);
  }

  _showModal(show: boolean) {
    if (!this.modal) return;
    if (show === this.modal.isActive()) return;

    if (show) {
      this.modal.show();
    } else {
      this.modal.hide();
    }
  }

  onFilesChanged(files) {
    if (files.length != 1) {
      // only allow single file
      this._notifications.error('Multiple workflows', "It's not possible to specify more than one workflow at one.");
      return;
    }
    if (files[0].type != "text/xml") {
      // only allow xml files
      this._notifications.error('Invalid workflow', "Please provide a valid ProvXML file");
      return;
    }

    this.file = files[0];
    this.workflowName = this.file.name.replace(/\.[^/.]+$/, "")

    this.parseWorkflow();
  }

  parseWorkflow() {
    let reader = new FileReader();
    let xml;
    let that = this;
    reader.onload = () => {
      that.provXML = new ProvXML(reader.result);
    }
    reader.readAsText(this.file);
  }

  removeFile() {
    this.file = null
  }

  upload() {
    this._store.dispatch(new CreateWorkflow(this.workflowName, this.provXML, this.parent.id));
    this.close();
  }

  close() {
    this.visibleChange.emit(false);
  }
}
