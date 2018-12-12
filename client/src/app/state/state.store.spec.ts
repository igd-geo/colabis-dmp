import { inject } from '@angular/core/testing';

import { AppState } from './app.state';
import { Action } from './actions';
import { Reducer } from './reducer';

// Load the implementations that should be tested
import { StateStore } from './state.store';

class MockIncReducer implements Reducer {
  reduce(state: AppState, action: Action): AppState {
    if (action instanceof MockIncAction) {
      return state.update('value', 1);
    } else if (action instanceof MockInitAction) {
      return state.update('value', action.value);
    }
    return state;
  }

  getInitialState() {
    return { value: 0 };
  }
}

class MockSquareReducer implements Reducer {
  reduce(state: AppState, action: Action): AppState {
    if (action instanceof MockSquareAction) {
      let val = state.get('value');
      return state.update('value', val * val);
    }
    return state;
  }

  getInitialState() {
    return { value: 2 };
  }
}


class MockIncAction implements Action {
}
class MockSquareAction implements Action {
}
class MockInitAction implements Action {
  constructor(public value: number) {
  }
}

describe('StateStore', () => {

  beforeEach(() =>
      inject([StateStore], (store: StateStore) =>
          store.registerReducer(new MockIncReducer())
      )
  );

  it('should be injectable', () =>
      inject([StateStore], (store: StateStore) =>
          expect(store).toBeDefined()
      )
  );

  it('should register reducers', () =>
      inject([StateStore], (store: StateStore) =>
          expect(store.reducers.size).toEqual(1)
      )
  );

  it('should emit initial value', () =>
      inject([StateStore], (store: StateStore) =>
          store.state.subscribe(s =>
              expect(s.get()).toEqual({ value: 0 })
          )
      )
  );

  it('should register multiple reducers', () =>
      inject([StateStore], (store: StateStore) => {
        expect(store.reducers.size).toEqual(1);
        store.registerReducer(new MockIncReducer());
        expect(store.reducers.size).toEqual(2);
      })
  );

  it('should changesState on message', () =>
      inject([StateStore], (store: StateStore) => {
        store.dispatch(new MockIncAction());
        store.state.subscribe((s) => {
          expect(s.get('value')).toEqual(1);
        });
      })
  );

  it('should change state continuously', () =>
      inject([StateStore], (store: StateStore) => {
        expect(store.reducers.size).toEqual(1);
        store.dispatch(new MockIncAction());
        let i = 1;
        store.state.subscribe((s) => {
          expect(s.get('value')).toEqual(i++);
        });
        store.dispatch(new MockIncAction());
        store.dispatch(new MockIncAction());
      })
  );

  it('should handle multiple reducers', () =>
      inject([StateStore], (store: StateStore) => {
        // Init with 3
        store.dispatch(new MockInitAction(3));
        // Register Square
        store.registerReducer(new MockSquareReducer());
        store.dispatch(new MockIncAction());
        store.dispatch(new MockSquareAction());
        store.state.subscribe((s) => {
          expect(s.get('value')).toEqual(16);
        });
      })
  );
});
