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

import fakeDataGenerators from './fakeDataGenerators';

// For debugging!
window._ = _;

const NOW = Date.now();
const TIME_RANGE = 1000 * 60 * 60 * 24 * 30;
const Y_RANGE = 100000;

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

const lineData1 = fakeDataGenerators.makeFakeLineData(NOW, TIME_RANGE, Y_RANGE);

store.dispatch(DataActions.setData({
  'uuid-1': lineData1,
  'uuid-2': lineData1,
  'uuid-3': fakeDataGenerators.makeFakeEventData(NOW, TIME_RANGE, Y_RANGE),
  'uuid-4': fakeDataGenerators.makeFakeBucketedData(NOW, TIME_RANGE, Y_RANGE)
}));

let latestXAxis;
const onTimeRangeChange = _.debounce((xAxis) => {
  if (xAxis === latestXAxis) {
    return;
  } else {
    latestXAxis = xAxis;
    const { start, end } = xAxis;
    store.dispatch(DataActions.setData({
      'uuid-4': fakeDataGenerators.makeFakeBucketedData(end, end - start, Y_RANGE, (end - start) / 400)
    }));
  }
}, 1000);

store.subscribe(() => {
  onTimeRangeChange(store.getState().xAxis);
});

const chart = <DefaultChart store={store}/>

ReactDOM.render(chart, document.getElementById('test-container'));
