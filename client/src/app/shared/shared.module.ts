import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ComponentsModule } from './components';
import { DirectivesModule } from './directives';

import { KeysPipe } from './pipes/keys.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { StateStore } from '../state/state.store';
import { ResourceReducer, ResourceService } from '../resources';
import { PublicationService } from '../publications';
import { WorkflowReducer, WorkflowService } from '../workflow';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    DirectivesModule
  ],
  declarations: [
    FileSizePipe,
    KeysPipe
  ],
  exports: [
    CommonModule,
    ComponentsModule,
    DirectivesModule,
    FileSizePipe,
    FormsModule,
    HttpModule,
    KeysPipe,
    RouterModule,
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: SharedModule,
      providers: [
        StateStore,
        ResourceReducer,
        ResourceService,
        PublicationService,
        WorkflowReducer,
        WorkflowService
      ]
    };
  }
}
