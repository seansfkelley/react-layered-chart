import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { default as UnconnectedYAxisLayer } from '../../layers/YAxisLayer';
import { Range, Color } from '../../interfaces';
import { DEFAULT_Y_DOMAIN } from '../model/constants';
import { SeriesId, TBySeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectYDomains } from '../model/selectors';

export interface OwnProps {
  seriesIds: SeriesId[];
  font?: string;
  backgroundColor?: Color;
}

export interface ConnectedProps {
  yDomainBySeriesId: TBySeriesId<Range>;
}

@PureRender
export class YAxisLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    // TODO: How to get colors and scales for layers easily?
    // scales={this.props.seriesIds.map(seriesId => this.props.metadataBySeriesId[seriesId].yScale)}
    // colors={this.props.seriesIds.map(seriesId => this.props.metadataBySeriesId[seriesId].color)}
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

export default connect(mapStateToProps)(YAxisLayer) as React.ComponentClass<OwnProps>;
