import * as React from 'react';
import { connect } from 'react-redux';

import { Interval, AxisSpec, XAxisLayer } from '../../core';
import { ChartState } from '../model/state';
import { selectXDomain } from '../model/selectors';

export interface OwnProps extends AxisSpec {
  font?: string;
}

export interface ConnectedProps {
  xDomain: Interval;
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(XAxisLayer) as React.ComponentClass<OwnProps>;
