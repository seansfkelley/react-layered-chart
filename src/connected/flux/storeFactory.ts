import * as _ from 'lodash';
import { applyMiddleware, createStore, Store, compose, Middleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import createDebounced from 'redux-debounced';

import { ActionType } from './atomicActions';
import reducer from './reducer';
import { ChartId, DebugStoreHooks } from '../interfaces';
import { ChartState } from '../model/state';

// chartId is only used for memoization.
function _createStore(chartId?: ChartId, debugHooks?: DebugStoreHooks): Store<ChartState> {
  let middlewares: Middleware[] = [
    createDebounced(),
    ThunkMiddleware
  ];
  if (debugHooks && debugHooks.middlewares) {
    middlewares = middlewares.concat(debugHooks.middlewares as Middleware[]);
  }

  let enhancers = [
    applyMiddleware(...middlewares)
  ];
  if (debugHooks && debugHooks.enhancers) {
    enhancers = enhancers.concat(debugHooks.enhancers);
  }

  // hacking typings for `compose` because the redux typings have typings for when
  // the `compose` method has 1, 2, 3, and 3 + more arguments but no typings for
  // when the first argument is a spread
  return createStore(reducer, (compose as (...funcs: Function[]) => any)(...enhancers));
}

const memoizedCreateStore = _.memoize(_createStore);

export default function(chartId?: ChartId, debugHooks?: DebugStoreHooks) {
  if (chartId) {
    return memoizedCreateStore(chartId, debugHooks);
  } else {
    return _createStore(chartId, debugHooks);
  }
}
