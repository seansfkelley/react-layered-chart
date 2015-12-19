// This is cause the JSX compiles to React.createElement... hm, don't like that this dependency isn't explicitly used.
import React from 'react';

import ReactDOM from 'react-dom';
import d3 from 'd3';

import DefaultChart from './DefaultChart';
import ActionType from './flux/ActionType';
import storeFactory from './flux/storeFactory';

const X_RANGE = 1000;
const Y_RANGE = 100000;

function makeFakeData() {
  const data = [];
  for (let i = 0; i < 10; ++i) {
    data.push({ timestamp: Math.random() * X_RANGE, value: Math.random() * Y_RANGE });
  }
  data.sort((a, b) => b.timestamp - a.timestamp);
  return data;
}

const store = storeFactory();

store.dispatch({
  type: ActionType.SET_X_AXIS,
  payload: {
    start: 0,
    end: X_RANGE
  }
});

store.dispatch({
  type: ActionType.SET_Y_AXIS,
  payload: {
    start: 0,
    end: Y_RANGE
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
