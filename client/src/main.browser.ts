// load boostrap
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ApplicationRef } from '@angular/core';

/*
 * Platform and Environment
 * our providers/directives/pipes
 */
import { decorateModuleRef } from './app/environment';

/*
 * App Component
 * our top level component that holds all of our components
 */
import { AuthenticationService } from './app/auth/authentication.service';
import { AppModule } from 'app';

/*
 * Bootstrap our Angular app with a top level component `App` and inject
 * our Services and Providers into Angular's dependency injection
 */
export function main(): Promise<any> {
  return platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(decorateModuleRef)
    .catch(err => console.error(err));
}

export function protectedMain(): Promise<any> {
  return AuthenticationService.login().toPromise()
      .then(o => main())
      .catch(err => console.error(err));
}

if (document.readyState === 'complete') {
  protectedMain();
} else {
  document.addEventListener('DOMContentLoaded', protectedMain);
}
