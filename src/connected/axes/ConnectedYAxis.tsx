import * as React from 'react';
import { connect } from 'react-redux';

import { Interval, AxisSpec, YAxis } from '../../core';
import { SeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectYDomains } from '../model/selectors';

export interface OwnProps extends AxisSpec {
  seriesId: SeriesId;
}

export interface ConnectedProps {
  yDomain: Interval;
}

function mapStateToProps(state: ChartState, ownProps: OwnProps): ConnectedProps {
  return {
    yDomain: selectYDomains(state)[ownProps.seriesId]
  };
}

export default connect(mapStateToProps)(YAxis) as React.ComponentClass<OwnProps>;
