/*
This chart implements the basic interactions using built-in layers and state
management. It's pannable and zoomable.
*/

import * as React from 'react';

import { DATA, X_DOMAIN, Y_DOMAIN } from './test-data';
import {
  ChartProvider,
  Stack,
  ConnectedSimpleLineLayer,
  ConnectedInteractionCaptureLayer,
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
    <Stack>
      {/* Render the test data as a simple line chart. */}
      <ConnectedSimpleLineLayer seriesId={TEST_SERIES_ID}/>
      {/* Capture any mouse interactions and automatically trigger changes on the chart. */}
      <ConnectedInteractionCaptureLayer enablePan={true} enableZoom={true}/>
    </Stack>
  </ChartProvider>
);

export default CHART;
