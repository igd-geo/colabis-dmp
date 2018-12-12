import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthenticationService } from '../../auth/authentication.service';
import { Observable } from 'rxjs/Rx';

/**
 * This is the navbar component
 */
@Component({
  selector: 'navbar',
  styleUrls: [
    './navbar.css'
  ],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private logo: string = require('assets/img/dmp.png');

  constructor(
      private _auth: AuthenticationService
  ) { }

  get user() {
    return this._auth.user;
  }

  public logout(event: Event) {
    this._auth.logout();
    event.preventDefault();
  }
}
