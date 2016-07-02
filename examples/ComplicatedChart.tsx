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
  ConnectedSpanLayer,
  ConnectedBarLayer,
  ConnectedSelectionBrushLayer,
  ConnectedBucketedLineLayer
} from '../src';

const X_EXTENT = X_DOMAIN.max - X_DOMAIN.min;
const Y_EXTENT = Y_DOMAIN.max - Y_DOMAIN.min;

const MUNGED_DATA = DATA.slice(0, DATA.length - 1).map((datum, i) => ({
  minXValue: datum.xValue,
  maxXValue: DATA[i + 1].xValue,
  yValue: (Math.random() - 0.5) * datum.yValue * 0.75 + datum.yValue * 0.25
}));

const MUNGED_DATA2 = DATA.slice(0, DATA.length - 1).map((datum, i) => {
  const xExtent = DATA[i + 1].xValue - datum.xValue;

  const minYValue = datum.yValue - Math.random() * 2;
  const maxYValue = datum.yValue + Math.random() * 2;

  const yExtent = maxYValue - minYValue;

  return {
    minXValue: datum.xValue + xExtent * 0.25,
    maxXValue: datum.xValue + xExtent * 0.75,
    minYValue,
    maxYValue,
    firstYValue: minYValue + Math.random() * yExtent,
    lastYValue: minYValue + Math.random() * yExtent
  };
});


const MUNGED_Y_DOMAIN = {
  min: _.minBy(MUNGED_DATA, 'yValue').yValue,
  max: _.maxBy(MUNGED_DATA, 'yValue').yValue
};

const MUNGED_Y_DOMAIN2 = {
  min: _.minBy(MUNGED_DATA2, 'minYValue').minYValue,
  max: _.maxBy(MUNGED_DATA2, 'maxYValue').maxYValue
};

// All series need to have an ID.
const TEST_SERIES_ID_1 = 'foo';
const TEST_SERIES_ID_2 = 'bar';
const TEST_SERIES_ID_3 = 'quux';
const SPAN_SERIES_ID = 'baz';

const COLOR_1 = '#e11';
const COLOR_2 = 'rgba(50, 50, 220, 0.2)';

// Set up a test data loader that will just return this static data.
const DATA_LOADER = createStaticDataLoader({
  [TEST_SERIES_ID_1]: DATA,
  [TEST_SERIES_ID_2]: MUNGED_DATA,
  [TEST_SERIES_ID_3]: MUNGED_DATA2,
  [SPAN_SERIES_ID]: [{ minXValue: X_DOMAIN.min, maxXValue: X_DOMAIN.max }]
}, {
  [TEST_SERIES_ID_1]: Y_DOMAIN,
  [TEST_SERIES_ID_2]: MUNGED_Y_DOMAIN,
  [TEST_SERIES_ID_3]: MUNGED_Y_DOMAIN2
});

const CHART = (
  <ChartProvider
    // List all the series IDs that exist in this chart.
    seriesIds={[ TEST_SERIES_ID_1, TEST_SERIES_ID_2, TEST_SERIES_ID_3, SPAN_SERIES_ID ]}
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
      {/* <ConnectedBarLayer seriesId={TEST_SERIES_ID_2} color={COLOR_2}/> */}
      <ConnectedBucketedLineLayer seriesId={TEST_SERIES_ID_3} color={COLOR_2}/>
      {/* Render a visual bounding box around the data. */}
      <ConnectedSpanLayer seriesId={SPAN_SERIES_ID} fillColor='rgba(0, 0, 0, 0.05)' borderColor='#bbb'/>
      {/* Capture any mouse interactions and automatically trigger changes on the chart. */}
      <ConnectedInteractionCaptureLayer enablePan={true} enableZoom={true} enableHover={true} enableBrush={true}/>
      {/* Show a reference line for hover as the mouse moves around. */}
      <ConnectedHoverLineLayer color='green'/>
      {/* Show a mostly-transparent box indicating the user's selection. */}
      <ConnectedSelectionBrushLayer/>
      {/* Show one Y axis per series, overlaid on the left side of the chart. */}
      <ConnectedYAxisLayer
        axes={[{
          seriesId: TEST_SERIES_ID_1,
          color: COLOR_1
        }, {
          seriesId: TEST_SERIES_ID_2,
          color: COLOR_2
        }]}
        font='12px sans-serif'
      />
    </Stack>
    {/* Show the X axis. This stack puts the X axis in its own section. */}
    <Stack className='x-axis-stack'>
      <ConnectedXAxisLayer font='12px sans-serif'/>
    </Stack>
  </ChartProvider>
);

export default CHART;
