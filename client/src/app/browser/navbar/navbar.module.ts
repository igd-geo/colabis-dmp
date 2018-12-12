import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { NavbarComponent } from './navbar.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { NewFolderComponent } from './new-folder/new-folder.component';
import { UploadDialog } from './upload/upload.dialog';
import { WorkflowDialog } from './workflow/workflow.dialog';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    BreadcrumbComponent,
    NavbarComponent,
    NewFolderComponent,
    UploadDialog,
    WorkflowDialog
  ],
  exports: [NavbarComponent]
})
export class NavbarModule { }
