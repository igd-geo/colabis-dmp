import { AppState } from './app.state';
import { Action } from './actions';

/**
 * This Interface describes a reducer, which can be used to
 * transform the application state.
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
export interface Reducer {
  /**
   * If a scope is specified, the reducer will get only the partial application
   * state, which is associated to the scope.
   */
  scope?: string;

  /**
   * Apply an action to the current application state and
   * return the new state. In case the action can't be handled
   * by this reducer, it must return the original state.
   * @param state Current application state
   * @param action Action to be executed
   * @returns New application state
   */
  reduce(state: AppState, action: Action): AppState;

  /**
   * Return the initial state of the reducer. The result is merged with the
   * current application state during the registration process. If a scope
   * is specified the result will be merged with the correlating state
   * property instead.
   */
  getInitialState(): any;
}
