import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import {
  Range,
  Color,
  ScaleFunction,
  TimeBucketDatum,
  BucketedLineLayer as UnconnectedBucketedLineLayer
} from '../../core';
import { SeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectData, selectXDomain, selectYDomains } from '../model/selectors';

export interface OwnProps {
  seriesId: SeriesId;
  yScale?: ScaleFunction;
  color?: Color;
}

export interface ConnectedProps {
  data: TimeBucketDatum[];
  xDomain: Range;
  yDomain: Range;
}

@PureRender
class ConnectedBucketedLineLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return <UnconnectedBucketedLineLayer {...this.props}/>
  }
}

function mapStateToProps(state: ChartState, ownProps: OwnProps): ConnectedProps {
  return {
    data: selectData(state)[ownProps.seriesId],
    xDomain: selectXDomain(state),
    yDomain: selectYDomains(state)[ownProps.seriesId]
  };
}

export default connect(mapStateToProps)(ConnectedBucketedLineLayer) as React.ComponentClass<OwnProps>;
