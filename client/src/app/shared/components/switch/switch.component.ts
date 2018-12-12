import { Component, EventEmitter, 
  Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'ui-switch',
  templateUrl: './switch.html',
  styleUrls: [ './switch.css' ]
})
export class SwitchComponent implements OnInit {
  @Input('id') switchId: string;
  @Input('label-on') labelOn: string = 'ON';
  @Input('label-off') labelOff: string = 'OFF';

  @Input() value: boolean = false;
  @Output() valueChange: EventEmitter<boolean> = new EventEmitter();

  private inputId: string;

  ngOnInit() {
    this.inputId = this.switchId + "Input";
  }

  onValueChange(value) {
    this.valueChange.emit(value);
  }
}
