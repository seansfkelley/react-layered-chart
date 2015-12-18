import _ from 'lodash';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import ActionType from './ActionType';

function reduceCursor(state = null, action) {
  switch(action.type) {
    case ActionType.SET_CURSOR:
      return action.payload;

    default:
      return state;
  }
}

function reduceXAxis(state = { start: 0, end: 1000 }, action) {
  switch(action.type) {
    case ActionType.SET_X_AXIS:
      return action.payload;

    default:
      return state;
  }
}

function reduceYAxis(state = { start: 0, end: 1000 }, action) {
  switch(action.type) {
    case ActionType.SET_Y_AXIS:
      return action.payload;

    default:
      return state;
  }
}

function reduceSeriesIds(state = [], action) {
  switch(action.type) {
    case ActionType.ADD_SERIES:
      return state.concat([ action.payload ]);
    case ActionType.REMOVE_SERIES:
      return _.without(state, action.payload);

    default:
      return state;
  }
}

function reduceSeriesMetadata(state = {}, action) {
  switch(action.type) {
    case ActionType.SET_SERIES_METADATA:
      return _.merge({}, state, action.payload);

    default:
      return state;
  }
}

function reduceSeriesData(state = {}, action) {
  switch(action.type) {
    case ActionType.SET_SERIES_DATA:
      return _.merge({}, state, action.payload);

    default:
      return state;
  }
}

export default function() {
  const rootReducer = combineReducers({
    cursor: reduceCursor,
    xAxis: reduceXAxis,
    yAxis: reduceYAxis,
    seriesIds: reduceSeriesIds,
    seriesMetadataById: reduceSeriesMetadata,
    seriesDataById: reduceSeriesData
  });
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  return createStoreWithMiddleware(rootReducer);
};
