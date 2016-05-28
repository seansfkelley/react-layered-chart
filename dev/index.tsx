import * as _ from 'lodash';
import * as moment from 'moment';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import TEST_DATA from './test-data';
import {
  Stack,
  SimpleLineLayer
} from '../src';

import './dev-styles.less';
import '../styles/index.less';

const PARSED_TEST_DATA = TEST_DATA.map(({ timestamp, value }) => ({
  timestamp: moment(timestamp).valueOf(),
  value
}));

const TIMESTAMPS = _.map<{}, number>(PARSED_TEST_DATA, 'timestamp');
const VALUES = _.map<{}, number>(PARSED_TEST_DATA, 'value');

const APP_ELEMENT = document.getElementById('app');

const TEST_COMPONENT = (
  <Stack>
    <SimpleLineLayer
      data={PARSED_TEST_DATA}
      xDomain={{ min: _.min(TIMESTAMPS), max: _.max(TIMESTAMPS) }}
      yDomain={{ min: _.min(VALUES), max: _.max(VALUES) }}
    />
  </Stack>
);

ReactDOM.render(TEST_COMPONENT, APP_ELEMENT);
