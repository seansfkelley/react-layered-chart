import * as React from 'react';
import { connect } from 'react-redux';

import { Interval, AxisSpec, XAxis } from '../../core';
import { SeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectXDomain } from '../model/selectors';

export interface OwnProps extends AxisSpec {}

export interface ConnectedProps {
  xDomain: Interval;
}

function mapStateToProps(state: ChartState, ownProps: OwnProps): ConnectedProps {
  return {
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(XAxis) as React.ComponentClass<OwnProps>;
