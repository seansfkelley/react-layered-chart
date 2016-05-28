import * as moment from 'moment';

import { Range } from 'react-layered-chart';

export const DEFAULT_X_DOMAIN: Range = {
  min: moment().subtract(1, 'month').valueOf(),
  max: moment().valueOf()
};

export const DEFAULT_Y_DOMAIN: Range = {
  min: 0,
  max: 100
};
