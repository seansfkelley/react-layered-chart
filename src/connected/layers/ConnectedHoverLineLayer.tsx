import * as React from 'react';
import { connect } from 'react-redux';

import { Interval, HoverLineLayer } from '../../core';
import { ChartState } from '../model/state';
import { selectHover, selectXDomain } from '../model/selectors';

export interface OwnProps {
  color?: string;
}

export interface ConnectedProps {
  hover?: number;
  xDomain: Interval;
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    hover: selectHover(state),
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(HoverLineLayer) as React.ComponentClass<OwnProps>;
