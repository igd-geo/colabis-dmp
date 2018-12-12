import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Rx';

declare var Keycloak: any;

@Injectable()
export class KeycloakService {

  private static auth: any = {
    loggedIn: false,
    authz: null
  };

  public static login(): Observable<boolean> {
    let keycloakAuth: any = new Keycloak('/keycloak.json');
    KeycloakService.auth.loggedIn = false;
    console.log(JSON.stringify(keycloakAuth))
    return Observable.create(observer => {
      keycloakAuth.init({onLoad: 'login-required'})
        .success(() => {
          console.log('Authenticated...');
          console.log(keycloakAuth)
          KeycloakService.auth.loggedIn = true;
          KeycloakService.auth.authz = keycloakAuth;
          KeycloakService.auth.logoutUrl = keycloakAuth.authServerUrl + '';
          observer.next(true);
          observer.complete();
        }).error(() => {
          KeycloakService.auth.loggedIn = false;
          observer.next(true);
          observer.complete();
        });
    });
  }

  constructor(
      private _zone: NgZone
  ) {
    console.log('CREATE KEYCLOAK SERVICE');
  }


  get loggedIn() {
    return Observable.of(KeycloakService.auth.loggedIn);
  }

  public logout() {
    console.log('*** LOGOUT ***');
    let keycloak = KeycloakService.auth.authz;
    KeycloakService.auth.loggedIn = false;
    KeycloakService.auth.authz = null;
    window.location.href = keycloak.createLogoutUrl();
  }

  getToken(): Observable<string> {
    let promise = KeycloakService.auth.authz.updateToken(5);
    return this._toObservable(promise)
        .map(x => KeycloakService.auth.authz.token);
  }

  public loadUserInfo(): Observable<any> {
    if (!KeycloakService.auth.loggedIn) {
        return Observable.of({})
    }
    return this._toObservable(KeycloakService.auth.authz.loadUserInfo());
  }

  private _toObservable(promise: any) {
    return Observable.create(observer => {
      promise.success(v => {
        this._zone.run(() => {
          observer.next(v);
          observer.complete();
        });
      }).error(e => {
        this._zone.run(() => {
          observer.error(e);
        });
      });
    });
  }
}
