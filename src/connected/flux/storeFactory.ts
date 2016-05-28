import * as _ from 'lodash';
import { applyMiddleware, createStore } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import * as createLogger from 'redux-logger';
import createDebounced from 'redux-debounced';

import { ActionType } from '../model/ActionType';
import reducer from './reducer';
import { ChartId } from '../interfaces';

// process shim in case consumers don't provide a value.
const process = {
  env: {
    NODE_ENV: null
  }
};

// chartId is only used for memoization.
function _createStore(chartId?: ChartId) {
  let middlewares: Redux.Middleware[] = [
    createDebounced(),
    ThunkMiddleware
  ];

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(createLogger({
      actionTransformer: (action) => _.defaults({
        type: ActionType[ action.type ] || action.type
      }, action),
      collapsed: true
    }));
  }

  return applyMiddleware(...middlewares)(createStore)(reducer);
}

const memoizedCreateStore = _.memoize(_createStore);

export default function(chartId?: ChartId) {
  if (chartId) {
    return memoizedCreateStore(chartId);
  } else {
    return _createStore();
  }
}
