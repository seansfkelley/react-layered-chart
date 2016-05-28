import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';
import { Range, layers } from 'react-layered-chart';
const { YAxisLayer: LayeredChartYAxisLayer } = layers;

import { DEFAULT_Y_DOMAIN } from '../model/constants';
import { SeriesId, TBySeriesId } from '../model/typedefs';
import { SeriesMetadata, ChartState } from '../model/state';
import { selectYDomains } from '../model/selectors';

export interface OwnProps {
  seriesIds: SeriesId[];
  font?: string;
  backgroundColor?: string;
}

export interface ConnectedProps {
  metadataBySeriesId: TBySeriesId<SeriesMetadata>;
  yDomainBySeriesId: TBySeriesId<Range>;
}

@PureRender
export class YAxisLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <LayeredChartYAxisLayer
        yDomains={this.props.seriesIds.map(seriesId => this.props.yDomainBySeriesId[seriesId] || DEFAULT_Y_DOMAIN)}
        scales={this.props.seriesIds.map(seriesId => this.props.metadataBySeriesId[seriesId].yScale)}
        colors={this.props.seriesIds.map(seriesId => this.props.metadataBySeriesId[seriesId].color)}
        font={this.props.font}
        backgroundColor={this.props.backgroundColor}
      />
    );
  }
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    metadataBySeriesId: state.metadataBySeriesId,
    yDomainBySeriesId: selectYDomains(state)
  };
}

export default connect(mapStateToProps)(YAxisLayer) as React.ComponentClass<OwnProps>;
