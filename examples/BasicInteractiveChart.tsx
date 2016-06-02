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

const TEST_SERIES_ID = 'foo';

const DATA_LOADER = createStaticDataLoader({
  [TEST_SERIES_ID]: DATA
}, {
  [TEST_SERIES_ID]: Y_DOMAIN
});

const CHART = (
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

export default CHART;
