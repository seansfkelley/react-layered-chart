import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import {
  Range,
  Color,
  ScaleFunction,
  TimestampDatum,
  PointLayer as UnconnectedPointLayer
} from '../../core';
import { SeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectData, selectXDomain, selectYDomains } from '../model/selectors';

export interface OwnProps {
  seriesId: SeriesId;
  yScale?: ScaleFunction;
  color?: Color;
  radius?: number;
  innerRadius?: number;
}

export interface ConnectedProps {
  data: TimestampDatum[];
  xDomain: Range;
  yDomain: Range;
}

@PureRender
class ConnectedPointLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return <UnconnectedPointLayer {...this.props}/>
  }
}

function mapStateToProps(state: ChartState, ownProps: OwnProps): ConnectedProps {
  return {
    data: selectData(state)[ownProps.seriesId],
    xDomain: selectXDomain(state),
    yDomain: selectYDomains(state)[ownProps.seriesId]
  };
}

export default connect(mapStateToProps)(ConnectedPointLayer) as React.ComponentClass<OwnProps>;
