import * as _ from 'lodash';
import { applyMiddleware, createStore, Store, compose } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import * as createLogger from 'redux-logger';
import createDebounced from 'redux-debounced';

import { ActionType } from './atomicActions';
import reducer from './reducer';
import { ChartId } from '../interfaces';

declare var process: any;

// chartId is only used for memoization.
function _createStore(chartId?: ChartId): Store {
  let middlewares: Redux.Middleware[] = [
    createDebounced(),
    ThunkMiddleware
  ];

  if (process.env.NODE_ENV !== 'development') {
    return applyMiddleware(...middlewares)(createStore)(reducer);
  } else {
    middlewares.push(createLogger({
      actionTransformer: (action) => _.defaults({
        type: ActionType[ action.type ] || action.type
      }, action),
      collapsed: true
    }));
    const enhancers = compose(
      applyMiddleware(...middlewares),
      // Enable Chrome Redux Extension, see: https://github.com/zalmoxisus/redux-devtools-extension
      (window as any).devToolsExtension ? (window as any).devToolsExtension() : _.identity
    );
    return createStore(reducer, enhancers);
  }
}

const memoizedCreateStore = _.memoize(_createStore);

export default function(chartId?: ChartId) {
  if (chartId) {
    return memoizedCreateStore(chartId);
  } else {
    return _createStore();
  }
}
