import * as _ from 'lodash';
import { applyMiddleware, createStore, Store, compose, Middleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import createDebounced from 'redux-debounced';

import { ActionType } from './atomicActions';
import reducer from './reducer';
import { ChartId, DebugStoreHooks } from '../interfaces';

// chartId is only used for memoization.
function _createStore(chartId?: ChartId, debugHooks?: DebugStoreHooks): Store {
  let middlewares: Redux.Middleware[] = [
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

  return createStore(reducer, compose(...enhancers));
}

const memoizedCreateStore = _.memoize(_createStore);

export default function(chartId?: ChartId, debugHooks?: DebugStoreHooks) {
  if (chartId) {
    return memoizedCreateStore(chartId, debugHooks);
  } else {
    return _createStore(chartId, debugHooks);
  }
}
