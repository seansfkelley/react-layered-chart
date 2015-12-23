import _ from 'lodash';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import ActionType from './ActionType';

function mergeOverwriteArrays(objectValue, sourceValue) {
  if (_.isArray(sourceValue) && _.isArray(objectValue)) {
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

function reduceSeriesIds(state = [], action) {
  switch(action.type) {
    case ActionType.ADD_SERIES:
      return state.concat(action.payload);
    case ActionType.REMOVE_SERIES:
      return _.diff(state, action.payload);

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
    seriesIds: reduceSeriesIds,
    yDomainBySeriesId: reduceYDomain,
    metadataBySeriesId: reduceMetadata,
    dataBySeriesId: reduceData
  });
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  return createStoreWithMiddleware(rootReducer, initialState);
};
