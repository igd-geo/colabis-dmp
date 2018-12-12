import { NgZone, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';

import { Action } from './actions';
import { AppState } from './app.state';
import { Reducer } from './reducer';

class InitState implements Action { constructor(public state: any, public scope?: string) { }}

/**
 * The StateStore implements a predictable state container
 * as described by http://redux.js.org/
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@Injectable()
export class StateStore {

  private _pauser: Subject<boolean> = new BehaviorSubject(true);
  private _state: Observable<AppState>;
  private _dispatcher: Subject<Action> = new Subject<Action>();
  private _reducers: Set<Reducer> = new Set<Reducer>();
  private _value: number = 0;

  constructor() {
    console.log('CREATE APPLICATION STATE SERVICE');
    this._state = this.setupStateObserver(new AppState({}), this._dispatcher);
  }

  public registerReducer(reducer: Reducer) {
    this._reducers.add(reducer);
    let state = reducer.getInitialState();
    let action = new InitState(state, reducer.scope);
    this.dispatch(action);
  }

  get reducers() { return this._reducers; };

  get state() { return this._state; }

  /**
   * Dispatch an action to be executed eventually.
   *
   * @param action
   * @returns {StateStore} This instance, so allow method chaining
   */
  public dispatch(action: Action): StateStore {
    if (!NgZone.isInAngularZone()) {
      console.warn('WARNING: Action ' + this.getClassName(action) +
          ' was dispatched out of Angular zone!');
    }
    this._dispatcher.next(action);
    return this;
  }

  /**
   *
   * @param initState
   * @param actions
   * @returns {BehaviorSubject}
   */
  private setupStateObserver(initState: AppState,
                             actions: Observable<Action>): Observable<AppState> {

    const observable: Observable<AppState> =
        Observable.create(observer =>
          Observable.zip(
              this._pauser.filter(b => !!b),
              actions,
              (b, action) => {
                return action;
              }
          ).subscribe(action =>
            observer.next(action)
          )
        ).scan((state: AppState, action) => {
          this._pauser.next(false);
          console.log('Dispatch ' + ++this._value + '. Action ' + this.getClassName(action));

          if (action instanceof InitState) {
            // merge state with new init state
            let prop = action.scope;
            return state.update(prop, Object.assign({}, state.get(prop), action.state));
          } else {
            let reducers = Array.from(this._reducers.values());
            return reducers.reduce((s: AppState, reducer) => {
              let sstate = new AppState(s.get(reducer.scope));
              sstate = reducer.reduce(sstate, action);
              return s.update(reducer.scope, sstate.get());
            }, state);
          }
        }, initState);
    return this.wrapIntoBehaviour(initState, observable);
  }

  private wrapIntoBehaviour(init, observable) {
    const res = new BehaviorSubject(init);
    observable.subscribe(s => {
      res.next(s);
      this._pauser.next(true);
    });
    return res;
  }

  private getClassName(obj: any) {
    const funcNameRegex = /function (.{1,})\(/;
    let results = (funcNameRegex).exec(obj.constructor.toString());
    return (results && results.length > 1) ? results[1] : '';
  }
}
