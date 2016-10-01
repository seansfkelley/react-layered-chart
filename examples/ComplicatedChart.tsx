/*
This chart implements a bunch of various features from around the library to
demonstrate a more complex chart.
*/

import * as _ from 'lodash';
import * as React from 'react';

import {
  SIMPLE_LINE_DATA,
  SIMPLE_LINE_X_DOMAIN,
  SIMPLE_LINE_Y_DOMAIN,
  BAR_DATA,
  BAR_X_DOMAIN,
  BAR_Y_DOMAIN,
  BUCKETED_LINE_DATA,
  BUCKETED_LINE_X_DOMAIN,
  BUCKETED_LINE_Y_DOMAIN
} from './test-data';

import {
  ChartProvider,
  Stack,
  createStaticDataLoader,
  ConnectedSimpleLineLayer,
  ConnectedInteractionCaptureLayer,
  ConnectedHoverLineLayer,
  ConnectedBarLayer,
  ConnectedSelectionBrushLayer,
  ConnectedBucketedLineLayer,
  ConnectedXAxis,
  ConnectedYAxis
} from '../src';

// All series need to have an ID.
const SIMPLE_LINE_SERIES_ID = 'foo';
const BAR_SERIES_ID = 'bar';
const BUCKETED_LINE_SERIES_ID = 'baz';

const COLOR_1 = '#e77';
const COLOR_2 = '#7e7';
const COLOR_3 = '#77e';

const SIMPLE_LINE_EXTENT = SIMPLE_LINE_X_DOMAIN.max - SIMPLE_LINE_X_DOMAIN.min;

function shiftXValues<T extends { minXValue: number, maxXValue: number }>(data: T[], shift: number): T[] {
  return data.map(datum => _.defaults({
    minXValue: datum.minXValue + shift,
    maxXValue: datum.maxXValue + shift
  }, datum));
}

// Set up a test data loader that will just return this static data.
const DATA_LOADER = createStaticDataLoader({
  [SIMPLE_LINE_SERIES_ID]: SIMPLE_LINE_DATA,
  [BAR_SERIES_ID]: shiftXValues(BAR_DATA, -SIMPLE_LINE_EXTENT * 1.1),
  [BUCKETED_LINE_SERIES_ID]: shiftXValues(BUCKETED_LINE_DATA, SIMPLE_LINE_EXTENT * 1.1)
}, {
  [SIMPLE_LINE_SERIES_ID]: SIMPLE_LINE_Y_DOMAIN,
  [BAR_SERIES_ID]: BAR_Y_DOMAIN,
  [BUCKETED_LINE_SERIES_ID]: BUCKETED_LINE_Y_DOMAIN
});

const CHART = (
  <ChartProvider
    // List all the series IDs that exist in this chart.
    seriesIds={[ SIMPLE_LINE_SERIES_ID, BAR_SERIES_ID, BUCKETED_LINE_SERIES_ID ]}
    loadData={DATA_LOADER}
    // This state is only read once on initialization. Provide a meaningful value
    // so we don't start the chart in the middle of nowhere.
    defaultState={{
      xDomain: SIMPLE_LINE_X_DOMAIN
    }}
    className='example-chart complicated'
    loadDataDebounceTimeout={0}
  >
    {/* This stack has all the main views. */}
    <Stack>
      {/* Render the test data in a few different ways. */}
      <ConnectedSimpleLineLayer seriesId={SIMPLE_LINE_SERIES_ID} color={COLOR_1}/>
      <ConnectedBarLayer seriesId={BAR_SERIES_ID} color={COLOR_2}/>
      <ConnectedBucketedLineLayer seriesId={BUCKETED_LINE_SERIES_ID} color={COLOR_3}/>
      {/* Capture any mouse interactions and automatically trigger changes on the chart. */}
      <ConnectedInteractionCaptureLayer enablePan={true} enableZoom={true} enableHover={true} enableBrush={true}/>
      {/* Show a reference line for hover as the mouse moves around. */}
      <ConnectedHoverLineLayer color='green'/>
      {/* Show a mostly-transparent box indicating the user's selection. */}
      <ConnectedSelectionBrushLayer/>
      {/* Show one Y axis per series, overlaid on the left side of the chart. */}
      <div className='left-align-layer'>
         <ConnectedYAxis seriesId={BAR_SERIES_ID} color={COLOR_2}/>
         <ConnectedYAxis seriesId={SIMPLE_LINE_SERIES_ID} color={COLOR_1}/>
         <ConnectedYAxis seriesId={BUCKETED_LINE_SERIES_ID} color={COLOR_3}/>
      </div>
    </Stack>
    {/* Show some X axes. This Stack puts the X axes in their own section. */}
    <Stack className='x-axis-stack'>
      <div className='vertical-split-layer'>
        <ConnectedXAxis ticks={10}/>
        <ConnectedXAxis ticks={3}/>
      </div>
    </Stack>
  </ChartProvider>
);

export default CHART;
