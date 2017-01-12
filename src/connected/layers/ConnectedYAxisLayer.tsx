import * as React from 'react';
import { connect } from 'react-redux';
import { defaults } from 'lodash';

import { Color, AxisSpec, YAxisSpec, YAxisLayer } from '../../core';
import { SeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectYDomains } from '../model/selectors';

export interface ConnectedYAxisSpec extends AxisSpec {
  seriesId: SeriesId;
}

export interface OwnProps {
  axes: ConnectedYAxisSpec[];
  font?: string;
  backgroundColor?: Color;
}

export interface ConnectedProps {
  axes: YAxisSpec[];
}

function mapStateToProps(state: ChartState, ownProps: OwnProps): ConnectedProps {
  const yDomainsBySeriesId = selectYDomains(state);
  return {
    axes: ownProps.axes.map(axis => defaults({
      yDomain: yDomainsBySeriesId[axis.seriesId],
      axisId: axis.seriesId
    }, axis))
  };
}

export default connect(mapStateToProps)(YAxisLayer) as React.ComponentClass<OwnProps>;
