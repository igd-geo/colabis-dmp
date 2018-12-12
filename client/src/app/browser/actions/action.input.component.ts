import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Resource } from 'app/resources';

@Component({
  selector: 'action-input',
  template: `
  <form #form
      class="uk-form"
      (ngSubmit)="onSave($event)">
    <div class="form-button-input">
      <input id="input-value"
          [(ngModel)]="input"
          [placeholder]="placeholder || ''"
          name="name"
          [focus]="true">
      <div class="button-group">
        <a (click)="onSave($event)"
            [class.disabled]="!input"
            class="uk-button-link uk-icon-check uk-icon-justify uk-icon-hover"></a>
        <a (click)="onCancel($event)"
            class="uk-icon-remove uk-icon-justify uk-icon-hover"></a>
      </div>
    </div>
  </form>
  `,
  styleUrls: [ 'action.input.css' ],
  host: {'(keydown.Escape)': 'onCancel()'}
})
export class ActionInputComponent {

  @Input() public set value(value: string) {
    this._value = value;
    this.input = value;
  }
  @Input() placeholder: string = '';

  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() cancel: EventEmitter<string> = new EventEmitter();

  private input: string;
  private _value: string;

  private onSave(event) {
    event.preventDefault();
    event.stopPropagation();
    this._value = this.input;
    this.valueChange.emit(this._value);
  }

  private onCancel() {
    event.preventDefault();
    event.stopPropagation();
    this.input = this._value;
    this.cancel.emit(this._value);
  }
}
