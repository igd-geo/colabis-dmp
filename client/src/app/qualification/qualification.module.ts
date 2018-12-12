import { NgModule, ModuleWithProviders } from '@angular/core';
import { QualificationService } from './qualification.service';

@NgModule({
  imports: [ ],
  providers: [ ],
  declarations: [ ]
})
export class QualificationModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: QualificationModule,
      providers: [
        QualificationService
      ]
    };
  }
}
