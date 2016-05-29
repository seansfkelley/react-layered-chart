import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Range, Color, TimeSpanDatum, BarLayer as UnconnectedBarLayer } from '../../core';
import { SeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectData, selectXDomain, selectYDomains } from '../model/selectors';

export interface OwnProps {
  seriesId: SeriesId;
  color?: Color;
}

export interface ConnectedProps {
  data: TimeSpanDatum[];
  xDomain: Range;
  yDomain: Range;
}

@PureRender
class ConnectedBarLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return <UnconnectedBarLayer {...this.props}/>
  }
}

function mapStateToProps(state: ChartState, ownProps: OwnProps): ConnectedProps {
  return {
    data: selectData(state)[ownProps.seriesId],
    xDomain: selectXDomain(state),
    yDomain: selectYDomains(state)[ownProps.seriesId]
  };
}

export default connect(mapStateToProps)(ConnectedBarLayer) as React.ComponentClass<OwnProps>;
