/*
This chart implements one of the simplest possible static charts. It is not
interactive.
*/

import * as React from 'react';

// Import our static data.
import { DATA, X_DOMAIN, Y_DOMAIN } from './test-data';
import {
  Stack,
  SimpleLineLayer
} from '../src';

const CHART = (
  // Everything has to be in a Stack.
  <Stack className='example-chart'>
    {/* Render a static layer with our static data and view parameters. */}
    <SimpleLineLayer
      data={DATA}
      xDomain={X_DOMAIN}
      yDomain={Y_DOMAIN}
    />
  </Stack>
);

export default CHART;
