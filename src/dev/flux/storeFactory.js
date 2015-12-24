import _ from 'lodash';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import ActionType from './ActionType';

function mergeOverwriteArrays(objectValue, sourceValue) {
  // This rather loose conditional does two things at once:
  //   1. Prevent lodash from being clever and attempting to deep-merge
  //      arrays, which we definitely do not want.
  //   2. Prevent lodash from defensively copying the array, since we do
  //      immutable-by-convention, and copying the array circumvents all
  //      of the PureRenders sprinkled throughout the code.
  if (_.isArray(sourceValue)) {
    return sourceValue;
  }
  // If we don't return a value, it defaults to the normal behavior.
}

function reduceSelection(state = null, action) {
  switch(action.type) {
    case ActionType.SET_SELECTION:
      return action.payload;

    default:
      return state;
  }
}

function reduceHover(state = null, action) {
  switch(action.type) {
    case ActionType.SET_HOVER:
      return action.payload;

    default:
      return state;
  }
}

function reduceXDomain(state = { min: 0, max: 1000 }, action) {
  switch(action.type) {
    case ActionType.SET_X_DOMAIN:
      return action.payload;

    default:
      return state;
  }
}

function reduceYDomain(state = {}, action) {
  switch(action.type) {
    case ActionType.SET_SERIES_Y_DOMAIN:
      return _.merge({}, state, action.payload, mergeOverwriteArrays);

    default:
      return state;
  }
}

function reduceMetadata(state = {}, action) {
  switch(action.type) {
    case ActionType.SET_SERIES_METADATA:
      return _.merge({}, state, action.payload, mergeOverwriteArrays);

    default:
      return state;
  }
}

function reduceData(state = {}, action) {
  switch(action.type) {
    case ActionType.SET_SERIES_DATA:
      return _.merge({}, state, action.payload, mergeOverwriteArrays);

    default:
      return state;
  }
}

export default function(initialState = undefined) {
  const rootReducer = combineReducers({
    selection: reduceSelection,
    hover: reduceHover,
    xDomain: reduceXDomain,
    yDomainBySeriesId: reduceYDomain,
    metadataBySeriesId: reduceMetadata,
    dataBySeriesId: reduceData
  });
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  return createStoreWithMiddleware(rootReducer, initialState);
};
