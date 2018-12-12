import { NgModule } from '@angular/core';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SharedModule } from '../../shared/shared.module';

import { ResourceListComponent } from './list.component';

@NgModule({
  imports: [
    SharedModule,
    NgxDatatableModule
  ],
  declarations: [
    ResourceListComponent
  ],
  exports: [
    ResourceListComponent
  ]
})
export class ResourceListModule { }
