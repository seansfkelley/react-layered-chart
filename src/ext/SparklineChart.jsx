import React from 'react';
import PureRender from 'pure-render-decorator';

import Stack from '../core/Stack';

import SelectFromStore from './mixins/SelectFromStore';
import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';

@PureRender
@SelectFromStore
class SparklineChart extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };

  static selectFromStore = {
    xDomain: 'xDomain',
    yDomainBySeriesId: 'yDomainBySeriesId',
    metadataBySeriesId: 'metadataBySeriesId',
    dataBySeriesId: 'dataBySeriesId',
    seriesIds: 'seriesIds'
  };

  render() {
    return (
      <Stack className='sparkline-chart'>
        <MetadataDrivenDataLayer
          xDomain={this.state.xDomain}
          yDomainBySeriesId={this.state.yDomainBySeriesId}
          metadataBySeriesId={this.state.metadataBySeriesId}
          dataBySeriesId={this.state.dataBySeriesId}
          seriesIds={this.state.seriesIds}
        />
      </Stack>
    );
  }
}

export default SparklineChart;
