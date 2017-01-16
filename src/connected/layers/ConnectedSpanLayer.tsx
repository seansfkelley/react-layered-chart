import * as React from 'react';
import { connect } from 'react-redux';

import { Interval, Color, SpanLayer, SpanDatum } from '../../core';
import { ChartState } from '../model/state';
import { selectData, selectXDomain } from '../model/selectors';
import { SeriesId } from '../interfaces';

export interface OwnProps {
  seriesId: SeriesId;
  fillColor?: Color;
  borderColor?: Color;
}

export interface ConnectedProps {
  data: SpanDatum[];
  xDomain: Interval;
}

function mapStateToProps(state: ChartState, ownProps: OwnProps): ConnectedProps {
  if (state.seriesIds.indexOf(ownProps.seriesId) === -1) {
    throw new Error(`Cannot render data for missing series ID ${ownProps.seriesId}`);
  }

  return {
    data: selectData(state)[ownProps.seriesId],
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(SpanLayer) as React.ComponentClass<OwnProps>;
