import { Observable } from 'rxjs/Observable';

import { firstIf } from '../../operator/firstIf';

Observable.prototype.firstIf = firstIf;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    firstIf: typeof firstIf;
  }
}
