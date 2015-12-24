// This is cause the JSX compiles to React.createElement... hm, don't like that this dependency isn't explicitly used.
import React from 'react';

import ReactDOM from 'react-dom';
import _ from 'lodash';

import DefaultChart from '../ext/DefaultChart';
import SparklineChart from '../ext/SparklineChart';
import CombinedLogChart from '../ext/CombinedLogChart';
import LayerType from '../ext/LayerType';

import ActionType from './flux/ActionType';
import storeFactory from './flux/storeFactory';
import DataActions from './flux/DataActions';
import AxesActions from './flux/AxesActions';

import ReduxChartWrapper from './ReduxChartWrapper';
import fakeDataGenerators from './fakeDataGenerators';

const NOW = Date.now();
const TIME_RANGE = 1000 * 60 * 60 * 24 * 30;
const Y_RANGE = 100000;

const BASE_Y_DOMAIN = {
  min: -0.1 * Y_RANGE,
  max: Y_RANGE * 1.1
}

const store = storeFactory({
  xDomain: {
    min: NOW - TIME_RANGE,
    max: NOW
  },
  yDomainBySeriesId: {
    'uuid-1': _.clone(BASE_Y_DOMAIN),
    'uuid-2': _.clone(BASE_Y_DOMAIN),
    'uuid-3': _.clone(BASE_Y_DOMAIN),
    'uuid-4': _.clone(BASE_Y_DOMAIN),
    'uuid-5-group': _.clone(BASE_Y_DOMAIN)
  }
});

store.dispatch(DataActions.addSeries('uuid-5-group', 'uuid-4'));

store.dispatch(DataActions.setMetadata({
  'uuid-1': {
    layerType: LayerType.SIMPLE_LINE,
    color: 'rgba(255, 0, 0, 0.5)',
    unit: 'some-unit',
    unitType: 'some-unit-type'
  },
  'uuid-2': {
    layerType: LayerType.POINT,
    color: 'rgba(255, 0, 0, 0.5)',
    unit: 'some-unit',
    unitType: 'some-unit-type'
  },
  'uuid-3': {
    layerType: LayerType.BAR,
    color: 'rgba(0, 255, 0, 0.5)'
  },
  'uuid-4': {
    layerType: LayerType.BUCKETED_LINE,
    color: 'rgba(0, 0, 255, 0.5)',
    unit: 'some-other-unit',
    unitType: 'some-other-unit-type'
  },
  'uuid-5-group': {
    layerType: LayerType.GROUP,
    color: 'rgba(255, 0, 0, 0.5)',
    unit: 'some-other-unit',
    unitType: 'some-other-unit-type',
    groupedSeries: [
      { seriesId: 'uuid-5', layerType: LayerType.SIMPLE_LINE },
      { seriesId: 'uuid-5-hover', layerType: LayerType.POINT }
    ]
  }
}));

const lineData1 = fakeDataGenerators.makeFakeLineData(NOW, TIME_RANGE, Y_RANGE);

store.dispatch(DataActions.setData({
  'uuid-1': lineData1,
  'uuid-2': lineData1,
  'uuid-3': fakeDataGenerators.makeFakeBarData(NOW, TIME_RANGE, Y_RANGE),
  'uuid-4': fakeDataGenerators.makeFakeBucketedData(NOW, TIME_RANGE, Y_RANGE),
  'uuid-5': fakeDataGenerators.makeFakeLineData(NOW, TIME_RANGE, Y_RANGE),
  'uuid-5-hover': []
}));

let latestXDomain;
const onTimeRangeChange = _.debounce(xDomain => {
  if (xDomain === latestXDomain) {
    return;
  } else {
    latestXDomain = xDomain;
    const { min, max } = xDomain;
    const data = fakeDataGenerators.makeFakeBucketedData(max, max - min, Y_RANGE, (max - min) / 400);
    const minValue = _.min(data, d => d.bounds.minValue).bounds.minValue;
    const maxValue = _.max(data, d => d.bounds.maxValue).bounds.maxValue;

    store.dispatch(DataActions.setData({
      'uuid-4': data
    }));

    store.dispatch(AxesActions.setYDomains({
      'uuid-4': {
        min: minValue - (maxValue - minValue) * 0.1,
        max: maxValue + (maxValue - minValue) * 0.1
      }
    }));
  }
}, 1000);

let lastTimestamp;
const onHover = _.debounce(timestamp => {
  if (timestamp === lastTimestamp) {
    return;
  }

  lastTimestamp = timestamp;
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
}, 15);

store.subscribe(() => {
  onTimeRangeChange(store.getState().xDomain);
  onHover(store.getState().hover);
});

const chart = <div className='many-charts'>
  <ReduxChartWrapper store={store}>
    <DefaultChart/>
  </ReduxChartWrapper>

  <ReduxChartWrapper store={store}>
    <SparklineChart/>
  </ReduxChartWrapper>

  <ReduxChartWrapper store={store}>
    <CombinedLogChart/>
  </ReduxChartWrapper>
</div>

ReactDOM.render(chart, document.getElementById('test-container'));


// For debugging!
window._ = _;
window.store = store;
window.memoizeStats = require('memoizee/profile');
