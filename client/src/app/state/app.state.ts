import { JsonHelper } from '../shared/helpers';
export class AppState {

  constructor (private _state: any) { }

  /**
   * Get a property of the current state.
   * Dot notation and even array syntax can be used to
   * access nested properties.
   * @param prop property identifier
   * @returns {string|any}
   */
  public get(prop: string = null): any {
    return JsonHelper.get(this._state, prop);
  }

  /**
   * Update a value of the application state an return
   * the new, updated state
   * @param prop property indentifier
   * @param value new value
   * @returns {AppState} The new application state
   */
  public update(prop: string, value: any): AppState {
    let state = Object.assign({}, this._state);

    return new AppState(JsonHelper.set(state, prop, value));
  }

  private _clone(obj: any): any {
    return Object.assign({}, obj);
  }
}
