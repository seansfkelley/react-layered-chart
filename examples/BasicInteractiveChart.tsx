/*
This chart implements the basic interactions using built-in layers and state
management. It's pannable and zoomable.
*/

import * as React from 'react';
import {
  ChartProvider,
  ConnectedInteractionCaptureLayer,
  ConnectedLineLayer,
  DEFAULT_SHOULD_PAN,
  DEFAULT_SHOULD_ZOOM,
  DataLoader,
  Stack
} from '../src';
import { SIMPLE_LINE_DATA, SIMPLE_LINE_X_DOMAIN, SIMPLE_LINE_Y_DOMAIN } from './test-data';

// All series need to have an ID.
const SERIES_ID = 'foo';

// Set up a test data loader that will just return this static data.
const SIMPLE_LINE_DATA_LOADER: DataLoader = () => ({
  [SERIES_ID]: new Promise(resolve => {
    resolve({
      data: SIMPLE_LINE_DATA,
      yDomain: SIMPLE_LINE_Y_DOMAIN
    });
  })
});

const CHART = (
  <ChartProvider
    // List all the series IDs that exist in this chart.
    seriesIds={[ SERIES_ID ]}
    loadData={SIMPLE_LINE_DATA_LOADER}
    // This state is only read once on initialization. Provide a meaningful value
    // so we don't start the chart in the middle of nowhere.
    defaultState={{
      xDomain: SIMPLE_LINE_X_DOMAIN
    }}
    className='example-chart'
    loadDataDebounceTimeout={0}
    pixelRatio={window.devicePixelRatio || 1}
  >
    <Stack>
      {/* Render the test data as a simple line chart. */}
      <ConnectedLineLayer seriesId={SERIES_ID}/>
      {/* Capture any mouse interactions and automatically trigger changes on the chart. */}
      <ConnectedInteractionCaptureLayer shouldPan={DEFAULT_SHOULD_PAN} shouldZoom={DEFAULT_SHOULD_ZOOM}/>
    </Stack>
  </ChartProvider>
);

export default CHART;
