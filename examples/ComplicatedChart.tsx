/*
This chart implements a bunch of various features from around the library to
demonstate a more complex chart.
*/

import * as React from 'react';

import { DATA, X_DOMAIN, Y_DOMAIN } from './test-data';
import {
  ChartProvider,
  Stack,
  ConnectedSimpleLineLayer,
  ConnectedInteractionCaptureLayer,
  ConnectedHoverLineLayer,
  createStaticDataLoader,
  ConnectedXAxisLayer,
  ConnectedYAxisLayer,
  YAxisLayer
} from '../src';

const X_EXTENT = X_DOMAIN.max - X_DOMAIN.min;
const Y_EXTENT = Y_DOMAIN.max - Y_DOMAIN.min;

const MUNGED_DATA = DATA.map(datum => ({
  xValue: (Math.random() - 0.5) * X_EXTENT * 0.001 + datum.xValue,
  yValue: (Math.random() - 0.5) * Y_EXTENT * 0.5 + datum.yValue
}));

const MUNGED_Y_DOMAIN = {
  min: _.minBy(MUNGED_DATA, 'yValue').yValue,
  max: _.maxBy(MUNGED_DATA, 'yValue').yValue
};

// All series need to have an ID.
const TEST_SERIES_ID_1 = 'foo';
const TEST_SERIES_ID_2 = 'bar';

const COLOR_1 = '#e11';
const COLOR_2 = '#339';

// Set up a test data loader that will just return this static data.
const DATA_LOADER = createStaticDataLoader({
  [TEST_SERIES_ID_1]: DATA,
  [TEST_SERIES_ID_2]: MUNGED_DATA
}, {
  [TEST_SERIES_ID_1]: Y_DOMAIN,
  [TEST_SERIES_ID_2]: MUNGED_Y_DOMAIN
});

const CHART = (
  <ChartProvider
    // List all the series IDs that exist in this chart.
    seriesIds={[ TEST_SERIES_ID_1, TEST_SERIES_ID_2 ]}
    loadData={DATA_LOADER}
    // This state is only read once on initialization. Provide a meaningful value
    // so we don't start the chart in the middle of nowhere.
    defaultState={{
      xDomain: X_DOMAIN
    }}
    className='example-chart'
  >
    {/* This stack has all the main views. */}
    <Stack>
      {/* Render the test data as a simple line chart. */}
      <ConnectedSimpleLineLayer seriesId={TEST_SERIES_ID_1} color={COLOR_1}/>
      <ConnectedSimpleLineLayer seriesId={TEST_SERIES_ID_2} color={COLOR_2}/>
      {/* Capture any mouse interactions and automatically trigger changes on the chart. */}
      <ConnectedInteractionCaptureLayer enablePan={true} enableZoom={true} enableHover={true}/>
      {/* Show a reference line for hover as the mouse moves around. */}
      <ConnectedHoverLineLayer/>
      {/* Show one Y axis per series, overlaid on the left side of the chart. */}
      <ConnectedYAxisLayer
        axes={[{
          seriesId: TEST_SERIES_ID_1,
          color: COLOR_1
        }, {
          seriesId: TEST_SERIES_ID_2,
          color: COLOR_2
        }]}
        font='12px MyriadPro-Regular'
      />
    </Stack>
    {/* Show the X axis. This stack puts the X axis in its own section. */}
    <Stack className='x-axis-stack'>
      <ConnectedXAxisLayer font='12px MyriadPro-Regular'/>
    </Stack>
  </ChartProvider>
);

export default CHART;
