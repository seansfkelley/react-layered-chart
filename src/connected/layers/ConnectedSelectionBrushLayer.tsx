import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Interval, Color, SpanLayer, ColoredSpanDatum } from '../../core';
import { ChartState } from '../model/state';
import { selectSelection, selectXDomain } from '../model/selectors';

export interface OwnProps {
  fillColor?: Color;
  borderColor?: Color;
}

export interface ConnectedProps {
  data: ColoredSpanDatum[];
  xDomain: Interval;
}

function mapStateToProps(state: ChartState): ConnectedProps {
  const selection = selectSelection(state);
  return {
    data: selection ? [{ minXValue: selection.min, maxXValue: selection.max }] : [],
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(SpanLayer) as React.ComponentClass<OwnProps>;
