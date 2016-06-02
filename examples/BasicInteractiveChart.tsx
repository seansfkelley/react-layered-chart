/*
This chart implements the basic interactions using built-in layers and state
management. It's pannable, zoomable and hoverable.
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
  ConnectedXAxisLayer
} from '../src';

// All series need to have an ID.
const TEST_SERIES_ID = 'foo';

// Set up a test data loader that will just return this static data.
const DATA_LOADER = createStaticDataLoader({
  [TEST_SERIES_ID]: DATA
}, {
  [TEST_SERIES_ID]: Y_DOMAIN
});

const CHART = (
  <ChartProvider
    // List all the series IDs that exist in this chart.
    seriesIds={[ TEST_SERIES_ID ]}
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
      <ConnectedSimpleLineLayer seriesId={TEST_SERIES_ID}/>
      {/* Capture any mouse interactions and automatically trigger changes on the chart. */}
      <ConnectedInteractionCaptureLayer enablePan={true} enableZoom={true} enableHover={true}/>
      {/* Show the hover line as the mouse moves around. */}
      <ConnectedHoverLineLayer/>
    </Stack>
    {/* This stack puts the X axis in its own section. */}
    <Stack className='x-axis-stack'>
      <ConnectedXAxisLayer font='12px MyriadPro-Regular'/>
    </Stack>
  </ChartProvider>
);

export default CHART;
