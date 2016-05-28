import * as _ from 'lodash';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import TEST_DATA, { dataLoader } from './test-data';
import {
  ChartProvider,
  Stack,
  SimpleLineLayer,
  ConnectedInteractionLayer
} from '../src';
import StackedSeriesLayer from './StackedSeriesLayer';

import './dev-styles.less';
import '../styles/index.less';

const TIMESTAMPS = _.map<{}, number>(TEST_DATA, 'timestamp');
const DEFAULT_X_DOMAIN = {
  min: _.min(TIMESTAMPS),
  max: _.max(TIMESTAMPS)
};

const APP_ELEMENT = document.getElementById('app');

const TEST_COMPONENT = (
  <ChartProvider
    seriesIds={[ 'foo' ]}
    loadData={dataLoader}
    defaultState={{
      xDomain: DEFAULT_X_DOMAIN
    }}
  >
    <Stack>
      <StackedSeriesLayer seriesIds={[ 'foo' ]}/>
      <ConnectedInteractionLayer enablePan={true} enableZoom={true} enableHover={true}/>
    </Stack>
  </ChartProvider>
);

ReactDOM.render(TEST_COMPONENT, APP_ELEMENT);
