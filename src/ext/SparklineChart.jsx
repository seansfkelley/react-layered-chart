import React from 'react';
import PureRender from 'pure-render-decorator';

import Stack from '../core/Stack';
import propTypes from '../core/propTypes';

import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';

@PureRender
class SparklineChart extends React.Component {
  static propTypes = {
    seriesIds: React.PropTypes.arrayOf(React.PropTypes.string),
    xDomain: propTypes.range,
    yDomainBySeriesId: React.PropTypes.objectOf(propTypes.range),
    metadataBySeriesId: React.PropTypes.object,
    dataBySeriesId: React.PropTypes.object
  };

  static defaultProps = {
    seriesIds: [],
    xDomain: { min: 0, max: 0 },
    yDomainBySeriesId: {},
    metadataBySeriesId: {},
    dataBySeriesId: {}
  };

  render() {
    return (
      <Stack className='sparkline-chart'>
        <MetadataDrivenDataLayer
          xDomain={this.props.xDomain}
          yDomainBySeriesId={this.props.yDomainBySeriesId}
          metadataBySeriesId={this.props.metadataBySeriesId}
          dataBySeriesId={this.props.dataBySeriesId}
          seriesIds={this.props.seriesIds}
        />
      </Stack>
    );
  }
}

export default SparklineChart;
