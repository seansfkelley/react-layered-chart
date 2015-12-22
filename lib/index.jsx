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

function makeFakeBucketedData() {
  const data = [];
  let startTime = NOW - TIME_RANGE;
  while (startTime < NOW) {
    const endTime = startTime + 1000 * 60 * 60 * 24;
    if (Math.random() > 0.9) {
      startTime = endTime;
      continue;
    }

    const actualStartTime = startTime + Math.random() * 1000 * 60 * 60 * 24 * 0.1;
    const actualEndTime = endTime - Math.random() * 1000 * 60 * 60 * 24 * 0.1;

    let value1;
    let value2;
    if (data.length) {
      value1 = data[data.length - 1].bounds.minValue + (Math.random() - 0.5) * Y_RANGE * 0.1;
      value2 = data[data.length - 1].bounds.maxValue + (Math.random() - 0.5) * Y_RANGE * 0.1;
    } else {
      value1 = Math.random() * Y_RANGE * 0.1 + Y_RANGE / 2;
      value2 = Math.random() * Y_RANGE * 0.1 + Y_RANGE / 2;
    }

    const minValue = Math.min(value1, value2);
    const maxValue = Math.max(value1, value2);

    data.push({
      bounds: {
        startTime,
        endTime,
        minValue,
        maxValue
      },
      earliestPoint: {
        timestamp: actualStartTime,
        value: Math.random() * (maxValue - minValue) + minValue
      },
      latestPoint: {
        timestamp: actualEndTime,
        value: Math.random() * (maxValue - minValue) + minValue
      }
    });

    startTime = endTime;
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

store.dispatch(DataActions.addSeries('uuid-4'));

store.dispatch(DataActions.setMetadata({
  'uuid-1': {
    chartType: ChartType.SIMPLE_LINE
  },
  'uuid-2': {
    chartType: ChartType.POINT
  },
  'uuid-3': {
    chartType: ChartType.TIME_SPAN
  },
  'uuid-4': {
    chartType: ChartType.BUCKETED_LINE
  }
}));

const lineData1 = makeFakeLineData();

store.dispatch(DataActions.setData({
  'uuid-1': lineData1,
  'uuid-2': lineData1,
  'uuid-3': makeFakeEventData(),
  'uuid-4': makeFakeBucketedData()
}));

const chart = <DefaultChart store={store}/>

ReactDOM.render(chart, document.getElementById('test-container'));
