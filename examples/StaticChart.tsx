import * as React from 'react';

import { DATA, X_DOMAIN, Y_DOMAIN } from './test-data';
import {
  Stack,
  SimpleLineLayer
} from '../src';

const CHART = (
  <Stack className='example-chart'>
    <SimpleLineLayer
      data={DATA}
      xDomain={X_DOMAIN}
      yDomain={Y_DOMAIN}
    />
  </Stack>
);

export default CHART;
