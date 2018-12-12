import { Operator } from 'rxjs/Operator';
import { Subscriber } from 'rxjs/Subscriber';
import { Observable } from 'rxjs/Observable';
import { TeardownLogic } from 'rxjs/Subscription';


export function firstIf<T>(this: Observable<T>,
                           predicate?: (value: T) => boolean): Observable<T>;

/**
 * Emits only the first value emitted by the source Observable if it
 * meets the condition.
 *
 * <span class="informal">Takes the first value from the source if it meets
 * the condition, then completes.</span>
 *
 * `firstIf` returns an Observable that emits only the first value emitted
 * by the source Observable, if it matches the specified condition. If the
 * condition does not match the observable completes without emitting any
 * value.
 *
 * @example <caption>Emits the first click if that happens on a DIV</caption>
 * var click = Rx.Observable.fromEvent(document, 'click');
 * var result = click.firstIf(ev => ev.target.tagName === 'DIV');
 * result.subscribe(x => console.log(x));
 *
 * @see {@link first}
 * @see {@link take}
 *
 * @param {function(value: T): boolean} [predicate]
 * An optional function called with the first item to test for condition matching.
 * @return {Observable<T>} An Observable that emits only the first value  emitted
 * by the source Observable if it matches the condition
 * @method firstIf
 * @owner Observable
 */
export function firstIf<T>(this: Observable<T>,
                           predicate?: (value: T) => boolean): Observable<T> {
  return this.lift(new FirstIfOperator(predicate));
}

class FirstIfOperator<T> implements Operator<T, T> {
  constructor(
    private predicate: (value: T) => boolean
  ) { }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new FirstIfSubscriber(subscriber, this.predicate));
  }
}

class FirstIfSubscriber<T> extends Subscriber<T> {
  constructor(
    protected destination: Subscriber<T>,
    private predicate: (value: T) => boolean
  ) {
    super(destination);
  }

  protected _next(value: T): void {
    if (this.predicate) {
      this._tryPredicate(value);
    } else {
      this._emit(value);
    }
  }

  private _tryPredicate(value: T) {
    try {
      if (this.predicate(value)) {
        this._emit(value);
      }
      this._finalize();
    } catch (err) {
      this.destination.error(err);
    }
  }

  private _emit(value?: T) {
    this.destination.next(value);
  }

  private _finalize() {
    this.destination.complete();
    this.unsubscribe();
  }
}


