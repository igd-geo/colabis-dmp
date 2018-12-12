import { 
	Component, Input, Output, EventEmitter,
	OnInit, OnChanges
} from '@angular/core';
import { 
	FormBuilder, Validators
} from '@angular/forms';
import { BrowserService } from '../browser.service';
import { Resource } from 'app/resources';
import { EditData, Property } from './utils';

@Component({
	selector: 'editextras-dialog',
	styles: [
		require('./edit-extras.style.css')
	],
	template: require('./edit-extras.html')
})
export class EditExtrasDialog implements OnInit, OnChanges{
	@Input() visible: boolean;
	@Input() editable: boolean;
	@Input() resource: Resource;
	@Input() editdata: EditData = null;
	@Output() visibleChange: EventEmitter<boolean> = new EventEmitter();

	private modal: UIkit.ModalElement;

	public editForm = this.fb.group({
		key: ["", Validators.required],
		value: ["", Validators.required]
	});

	constructor(
		public fb: FormBuilder, 
		private _browser: BrowserService
	) { }

	ngOnInit(){
		this.modal = UIkit.modal('#edit-extras-modal');
	}

	ngOnChanges(changes: any) {
		this._showModal(this.visible);
	}

	_showModal(show: boolean) {
    if (!this.modal) return;
    if (show === this.modal.isActive()) return;

    if (show) {
      this.modal.show();
      this.editForm.setValue({
      	key: this.editdata.key,
      	value: this.editdata.value
      });
    } else {
      this.modal.hide();
    }
  }

	save(){
		if (this.editdata.key !== this.editForm.value.key) {
			delete this.resource.extras[this.editdata.key];
		}
    this.resource.extras[this.editForm.value.key] = this.editForm.value.value;
    this._browser.modifyResource(this.resource);
    this.close();
    this.editForm.reset();
	}

	close(){
		this.visibleChange.emit(false);
	}

}
