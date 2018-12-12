import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BrowserComponent } from './browser.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'browser', component: BrowserComponent},
      { path: 'browser/:id', component: BrowserComponent}
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class BrowserRoutingModule { }
