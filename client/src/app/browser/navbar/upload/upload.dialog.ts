import {
  Component, EventEmitter, Input, OnChanges,
  OnInit, OnDestroy, Output
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { BrowserService } from '../../browser.service';
import { Resource } from '../../../resources';

@Component({
  selector: 'upload-dialog',
  styles: [
    require('./upload.style.css')
  ],
  template: require('./upload.html')
})
export class UploadDialog implements OnInit, OnDestroy, OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter();


  private modal: UIkit.ModalElement;

  private files: File[] = [];
  private storageNames: string[] = [];

  private parent: Resource;

  private subscription: Subscription;

  constructor(
    private _browser: BrowserService
  ) {
  }

  ngOnInit() {
    this.subscription = this._browser.folder.subscribe(s =>
      this.parent = s
    );
    this.modal = UIkit.modal('#upload-modal');
    $('#upload-modal').on({
      'hide.uk.modal': (e) => {
        this.visibleChange.emit(false);
      }
    });
    // Initialise drop area
    let self = this;
    let drop = $('#upload-drop');
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
        drop.addClass('uk-dragover');
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
    this.files = [];
    this.storageNames = [];
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
    for (let i = 0; i < files.length; i++) {
      this.files.push(files[i]);
      this.storageNames.push(files[i].name);
    }
  }

  changeFilename(i: number, name: string) {
    this.storageNames[i] = name;
  }

  removeFile(i: number) {
    this.files.splice(i, 1);
  }

  upload() {
    for (let i = 0; i < this.files.length; i++) {
      this._browser.upload(this.storageNames[i], this.files[i], this.parent.id);
    }
    this.close();
  }

  close() {
    this.visibleChange.emit(false);
  }
}
