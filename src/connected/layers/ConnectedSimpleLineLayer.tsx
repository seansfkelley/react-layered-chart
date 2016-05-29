import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import {
  Range,
  TimestampDatum,
  SeriesData,
  ScaleFunction,
  SimpleLineLayer as UnconnectedSimpleLineLayer
} from '../../core';
import { SeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectData, selectXDomain, selectYDomains } from '../model/selectors';

export interface OwnProps {
  seriesId: SeriesId;
  yScale?: ScaleFunction;
  color?: string;
}

export interface ConnectedProps {
  data: TimestampDatum[];
  xDomain: Range;
  yDomain: Range;
}

@PureRender
class ConnectedSimpleLineLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return <UnconnectedSimpleLineLayer {...this.props}/>;
  }
}

function mapStateToProps(state: ChartState, ownProps: OwnProps): ConnectedProps {
  return {
    data: selectData(state)[ownProps.seriesId],
    xDomain: selectXDomain(state),
    yDomain: selectYDomains(state)[ownProps.seriesId]
  };
}

export default connect(mapStateToProps)(ConnectedSimpleLineLayer) as React.ComponentClass<OwnProps>;
