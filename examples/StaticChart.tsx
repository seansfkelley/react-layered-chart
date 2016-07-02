/*
This chart implements one of the simplest possible static charts. It is not
interactive.
*/

import * as React from 'react';

// Import our static data.
import { SIMPLE_LINE_DATA, SIMPLE_LINE_X_DOMAIN, SIMPLE_LINE_Y_DOMAIN } from './test-data';
import {
  Stack,
  SimpleLineLayer
} from '../src';

const CHART = (
  // Everything has to be in a Stack.
  <Stack className='example-chart'>
    {/* Render a static layer with our static data and view parameters. */}
    <SimpleLineLayer
      data={SIMPLE_LINE_DATA}
      xDomain={SIMPLE_LINE_X_DOMAIN}
      yDomain={SIMPLE_LINE_Y_DOMAIN}
    />
  </Stack>
);

export default CHART;
