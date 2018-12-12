import { NgModule } from '@angular/core';
import { BrowserComponent } from './browser.component';
import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import { TreeModule } from 'angular2-tree-component';

import { SharedModule } from '../shared/shared.module';

import { ActionsModule } from './actions';
import { NavbarModule } from './navbar';
import { ResourceInfoModule } from './info';
import { ResourceTreeComponent } from './tree';
import { ResourceListModule } from './list';

import { BrowserRoutingModule } from './browser-routing.module';
import { BrowserService } from './browser.service';

@NgModule({
  imports: [
    ActionsModule,
    SharedModule,
    BrowserRoutingModule,
    ResourceInfoModule,
    NavbarModule,
    TreeModule,
    ResourceListModule
  ],
  declarations: [
    ResourceTreeComponent,
    BrowserComponent
  ],
  providers: [
    BrowserService
  ]
})
export class BrowserModule { }
