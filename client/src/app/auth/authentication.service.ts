import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { KeycloakService } from './keycloak.service';
import { AppState, Action, Reducer, StateStore } from 'app/state';

class UpdateUserInfo implements Action { constructor(public info: any) { } }

@Injectable()
export class AuthenticationService implements Reducer {

  public user: Observable<any> = this._store.state.map(s => s.get('auth.user'));

  public static login() {
    return KeycloakService.login();
  }

  constructor(
      private _store: StateStore,
      private _keycloak: KeycloakService
  ) {
    console.log('CREATE AUTHENTICATION SERVICE');
    this._store.registerReducer(this);
  }

  get loggedIn() {
    return this._keycloak.loggedIn;
  }

  get token() { 
    return this.loggedIn.flatMap(loggedIn =>
      !loggedIn ? Observable.of(null) : this._keycloak.getToken()
    )
  }

  public getInitialState(): any {
    return {user: null};
  }

  public updateUserInfo() {
    this._keycloak.loadUserInfo().subscribe(info =>
      this._store.dispatch(new UpdateUserInfo(info))
    );
  }

  public logout() {
    this._keycloak.logout();
  }

  reduce(state: AppState, action: Action): AppState {
    if (action instanceof UpdateUserInfo) {
      return state.update('user', action.info);
    }
    return state;
  }

  get scope() {
    return 'auth';
  }
}
