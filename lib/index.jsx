// This is cause the JSX compiles to React.createElement... hm, don't like that this dependency isn't explicitly used.
import React from 'react';

import ReactDOM from 'react-dom';
import d3 from 'd3';

import DefaultChart from './DefaultChart';
import ActionType from './flux/ActionType';
import storeFactory from './flux/storeFactory';

import _ from 'lodash';

// For debugging!
window._ = _;

const NOW = Date.now();
const TIME_RANGE = 1000 * 60 * 60 * 24 * 30;
const Y_RANGE = 100000;

function makeFakeData() {
  const data = [];
  for (let i = 0; i < 100; ++i) {
    data.push({ timestamp: NOW - Math.random() * TIME_RANGE, value: Math.random() * Y_RANGE });
  }
  data.sort((a, b) => a.timestamp - b.timestamp);
  return data;
}

const store = storeFactory();

store.dispatch({
  type: ActionType.SET_X_AXIS,
  payload: {
    start: NOW - TIME_RANGE,
    end: NOW
  }
});

store.dispatch({
  type: ActionType.SET_Y_AXIS,
  payload: {
    start: -0.1 * Y_RANGE,
    end: Y_RANGE * 1.1
  }
});

store.dispatch({
  type: ActionType.ADD_SERIES,
  payload: 'uuid-1'
});

store.dispatch({
  type: ActionType.ADD_SERIES,
  payload: 'uuid-2'
});

store.dispatch({
  type: ActionType.SET_SERIES_METADATA,
  payload: {
    'uuid-1': {
      chartType: 'line',
      stroke: 'green'
    },
    'uuid-2': {
      chartType: 'line',
      stroke: 'red'
    }
  }
});

store.dispatch({
  type: ActionType.SET_SERIES_DATA,
  payload: {
    'uuid-1': makeFakeData(),
    'uuid-2': makeFakeData()
  }
});

const chart = <DefaultChart store={store}/>

ReactDOM.render(chart, document.getElementById('test-container'));
