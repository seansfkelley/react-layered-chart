// This is cause the JSX compiles to React.createElement... hm, don't like that this dependency isn't explicitly used.
import React from 'react';

import ReactDOM from 'react-dom';

import DefaultChart from './DefaultChart';
import ActionType from './flux/ActionType';
import ChartType from './ChartType';
import storeFactory from './flux/storeFactory';

import DataActions from './flux/DataActions';
import AxesActions from './flux/AxesActions';

import _ from 'lodash';

import fakeDataGenerators from './fakeDataGenerators';

const NOW = Date.now();
const TIME_RANGE = 1000 * 60 * 60 * 24 * 30;
const Y_RANGE = 100000;

const BASE_Y_DOMAIN = {
  min: -0.1 * Y_RANGE,
  max: Y_RANGE * 1.1
}

const store = storeFactory({
  xAxis: {
    min: NOW - TIME_RANGE,
    max: NOW
  },
  yAxisBySeriesId: {
    'uuid-1': _.clone(BASE_Y_DOMAIN),
    'uuid-2': _.clone(BASE_Y_DOMAIN),
    'uuid-3': _.clone(BASE_Y_DOMAIN),
    'uuid-4': _.clone(BASE_Y_DOMAIN),
    'uuid-5': _.clone(BASE_Y_DOMAIN)
  }
});

store.dispatch(DataActions.addSeries('uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'));

store.dispatch(DataActions.setMetadata({
  'uuid-1': {
    chartType: ChartType.SIMPLE_LINE,
    color: 'rgba(255, 0, 0, 0.5)',
    unit: 'some-unit',
    unitType: 'some-unit-type'
  },
  'uuid-2': {
    chartType: ChartType.POINT,
    color: 'rgba(255, 0, 0, 0.5)',
    unit: 'some-unit',
    unitType: 'some-unit-type'
  },
  'uuid-3': {
    chartType: ChartType.TIME_SPAN,
    color: 'rgba(0, 255, 0, 0.5)'
  },
  'uuid-4': {
    chartType: ChartType.BUCKETED_LINE,
    color: 'rgba(0, 0, 255, 0.5)',
    unit: 'some-other-unit',
    unitType: 'some-other-unit-type'
  },
  'uuid-5': {
    chartType: ChartType.SIMPLE_LINE,
    color: 'rgba(255, 0, 255, 0.5)',
    unit: 'some-other-unit',
    unitType: 'some-other-unit-type'
  }
}));

const lineData1 = fakeDataGenerators.makeFakeLineData(NOW, TIME_RANGE, Y_RANGE);

store.dispatch(DataActions.setData({
  'uuid-1': lineData1,
  'uuid-2': lineData1,
  'uuid-3': fakeDataGenerators.makeFakeEventData(NOW, TIME_RANGE, Y_RANGE),
  'uuid-4': fakeDataGenerators.makeFakeBucketedData(NOW, TIME_RANGE, Y_RANGE),
  'uuid-5': fakeDataGenerators.makeFakeLineData(NOW, TIME_RANGE, Y_RANGE)
}));

let latestXAxis;
const onTimeRangeChange = _.debounce(xAxis => {
  if (xAxis === latestXAxis) {
    return;
  } else {
    latestXAxis = xAxis;
    const { min, max } = xAxis;
    const data = fakeDataGenerators.makeFakeBucketedData(max, max - min, Y_RANGE, (max - min) / 400);
    const minValue = _.min(data, d => d.bounds.minValue).bounds.minValue;
    const maxValue = _.max(data, d => d.bounds.maxValue).bounds.maxValue;

    store.dispatch(DataActions.setData({
      'uuid-4': data
    }));

    store.dispatch(AxesActions.setYAxes({
      'uuid-4': {
        min: minValue - (maxValue - minValue) * 0.1,
        max: maxValue + (maxValue - minValue) * 0.1
      }
    }));
  }
}, 1000);

const onHover = _.debounce(timestamp => {
  if (timestamp !== null) {
    const data = store.getState().dataBySeriesId['uuid-5'];
    const index = _.sortedIndex(data, { timestamp }, 'timestamp');
    store.dispatch(DataActions.setData({
      'uuid-5-hover': [ data[index] ]
    }));
  } else {
    store.dispatch(DataActions.setData({
      'uuid-5-hover': []
    }));
  }
}, 1000);

store.subscribe(() => {
  onTimeRangeChange(store.getState().xAxis);
  onHover(store.getState().hover);
});

const chart = <DefaultChart store={store}/>

ReactDOM.render(chart, document.getElementById('test-container'));


// For debugging!
window._ = _;
window.store = store;
