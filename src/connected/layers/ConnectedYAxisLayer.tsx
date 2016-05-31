import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Range, Color, YAxisLayer as UnconnectedYAxisLayer } from '../../core';
import { DEFAULT_Y_DOMAIN } from '../model/constants';
import { SeriesId, TBySeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectYDomains } from '../model/selectors';

// FIXME: How to get colors and scales for layers easily?
export interface OwnProps {
  seriesIds: SeriesId[];
  font?: string;
  backgroundColor?: Color;
}

export interface ConnectedProps {
  yDomainBySeriesId: TBySeriesId<Range>;
}

@PureRender
export class ConnectedYAxisLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <UnconnectedYAxisLayer
        yDomains={this.props.seriesIds.map(seriesId => this.props.yDomainBySeriesId[seriesId] || DEFAULT_Y_DOMAIN)}
        font={this.props.font}
        backgroundColor={this.props.backgroundColor}
      />
    );
  }
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    yDomainBySeriesId: selectYDomains(state)
  };
}

export default connect(mapStateToProps)(ConnectedYAxisLayer) as React.ComponentClass<OwnProps>;
