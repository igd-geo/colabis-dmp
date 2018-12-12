import { NgModule, ModuleWithProviders } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { KeycloakService } from './keycloak.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [ ]
})
export class AuthModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: AuthModule,
      providers: [
        AuthenticationService,
        KeycloakService
      ]
    };
  }
}
