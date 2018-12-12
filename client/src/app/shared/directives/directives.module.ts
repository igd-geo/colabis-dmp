import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClickOutsideDirective } from './click-outside.directive';
import { ClickPreventDefaultDirective } from './click-prevent-default.directive';
import { ClickStopPropagationDirective } from './click-stop-propagation.directive';
import { FocusDirective } from './focus.directive';
import { InitDirective } from './init.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ClickOutsideDirective,
    ClickPreventDefaultDirective,
    ClickStopPropagationDirective,
    FocusDirective,
    InitDirective
  ],
  exports: [
    ClickOutsideDirective,
    ClickPreventDefaultDirective,
    ClickStopPropagationDirective,
    FocusDirective,
    InitDirective
  ]
})
export class DirectivesModule { }
