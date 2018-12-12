import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';

import { ActionMenuComponent } from './action.component';
import { ActionMenuService } from './action.service';
import { ActionInputComponent } from './action.input.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ActionMenuComponent,
    ActionInputComponent
  ],
  providers: [
    ActionMenuService
  ],
  exports: [ ActionMenuComponent ]
})
export class ActionsModule { }
