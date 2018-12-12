import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ng2-tag-input';

import { SharedModule } from '../../shared/shared.module';

import { PropertiesComponent } from './properties.component';
import { DetailsComponent } from './details.component';
import { ResourceInfoComponent } from './info.component';
import { ExtrasComponent } from './extras.component';
import { EditExtrasDialog } from './edit-extras.dialog';
import { TagsComponent } from './tags.component';
import { PublishComponent } from './publish.component';

@NgModule({
  imports: [
    SharedModule,
    TagInputModule,
    ReactiveFormsModule
  ],
  declarations: [
    PropertiesComponent,
    DetailsComponent,
    ResourceInfoComponent,
    ExtrasComponent,
    EditExtrasDialog,
    TagsComponent,
    PublishComponent
  ],
  exports: [
    ResourceInfoComponent
  ]
})
export class ResourceInfoModule { }
