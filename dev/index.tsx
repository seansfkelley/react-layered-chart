import * as _ from 'lodash';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DATA, X_DOMAIN, Y_DOMAIN } from './test-data';
import {
  ChartProvider,
  Stack,
  SimpleLineLayer,
  ConnectedSimpleLineLayer,
  ConnectedInteractionCaptureLayer,
  ConnectedHoverLineLayer,
  createStaticDataLoader,
  ConnectedXAxisLayer
} from '../src';

import './dev-styles.less';
import '../styles/index.less';

const TEST_SERIES_ID = 'foo';

const DATA_LOADER = createStaticDataLoader({
  [TEST_SERIES_ID]: DATA
}, {
  [TEST_SERIES_ID]: Y_DOMAIN
});

const APP_ELEMENT = document.getElementById('app');

const BASIC_COMPONENT = (
  <Stack className='example-chart'>
    <SimpleLineLayer
      data={DATA}
      xDomain={X_DOMAIN}
      yDomain={Y_DOMAIN}
    />
  </Stack>
);

const ADVANCED_COMPONENT = (
  <ChartProvider
    seriesIds={[ TEST_SERIES_ID ]}
    loadData={DATA_LOADER}
    defaultState={{
      xDomain: X_DOMAIN
    }}
    className='example-chart'
  >
    <Stack>
      <ConnectedSimpleLineLayer seriesId={TEST_SERIES_ID}/>
      <ConnectedInteractionCaptureLayer enablePan={true} enableZoom={true} enableHover={true}/>
      <ConnectedHoverLineLayer/>
    </Stack>
    <Stack className='x-axis-stack'>
      <ConnectedXAxisLayer font='12px MyriadPro-Regular'/>
    </Stack>
  </ChartProvider>
);

const TEST_COMPONENT = (
  <div className='container'>
    <div className='explanation'>This is a basic, static chart. It is not interactive.</div>
    {BASIC_COMPONENT}
    <div className='explanation'>This is a more complex chart. Drag to pan and scroll to zoom.</div>
    {ADVANCED_COMPONENT}
  </div>
);

ReactDOM.render(TEST_COMPONENT, APP_ELEMENT);
