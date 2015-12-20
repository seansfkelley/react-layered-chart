// This is cause the JSX compiles to React.createElement... hm, don't like that this dependency isn't explicitly used.
import React from 'react';

import ReactDOM from 'react-dom';
import d3 from 'd3';

import DefaultChart from './DefaultChart';
import ActionType from './flux/ActionType';
import ChartType from './ChartType';
import storeFactory from './flux/storeFactory';

import DataActions from './flux/DataActions';

import _ from 'lodash';

// For debugging!
window._ = _;

const NOW = Date.now();
const TIME_RANGE = 1000 * 60 * 60 * 24 * 30;
const Y_RANGE = 100000;

function makeFakeLineData() {
  const data = [];
  for (let i = 0; i < 100; ++i) {
    data.push({ timestamp: NOW - Math.random() * TIME_RANGE, value: Math.random() * Y_RANGE });
  }
  data.sort((a, b) => a.timestamp - b.timestamp);
  return data;
}

function makeFakeEventData() {
  const data = [];
  for (let i = 0; i < 10; ++ i) {
    const start = NOW - Math.random() * TIME_RANGE;
    data.push({ timeSpan: { start, end: start + (1000 * 60 * 60 * (24 * Math.random())) }});
  }
  return data;
}

const store = storeFactory({
  xAxis: {
    start: NOW - TIME_RANGE,
    end: NOW
  },
  yAxis: {
    start: -0.1 * Y_RANGE,
    end: Y_RANGE * 1.1
  }
});

store.dispatch(DataActions.addSeries('uuid-1', 'uuid-2', 'uuid-3'));

store.dispatch(DataActions.setMetadata({
  'uuid-1': {
    chartType: ChartType.SIMPLE_LINE
  },
  'uuid-2': {
    chartType: ChartType.POINT
  },
  'uuid-3': {
    chartType: ChartType.TIME_SPAN
  }
}));

const lineData1 = makeFakeLineData();

store.dispatch(DataActions.setData({
  'uuid-1': lineData1,
  'uuid-2': lineData1,
  'uuid-3': makeFakeEventData()
}));

const chart = <DefaultChart store={store}/>

ReactDOM.render(chart, document.getElementById('test-container'));
