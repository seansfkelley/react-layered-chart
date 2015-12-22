import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';

import BucketedLineLayer from './BucketedLineLayer';
import PointLayer from './PointLayer';
import SimpleLineLayer from './SimpleLineLayer';
import TimeSpanLayer from './TimeSpanLayer';

import ChartType from '../ChartType';
import propTypes from '../propTypes';

@PureRender
class MetadataDrivenDataLayer extends React.Component {
  static propTypes = {
    xDomain: propTypes.range.isRequired,
    yDomainBySeriesId: React.PropTypes.objectOf(propTypes.range).isRequired,
    metadataBySeriesId: React.PropTypes.objectOf(React.PropTypes.object).isRequired,
    dataBySeriesId: React.PropTypes.object.isRequired,
    seriesIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  };

  render() {
    return (
      <div className='layer metadata-driven-data-layer'>
        {this.props.seriesIds.map(this._chooseLayerType)}
      </div>
    );
  }

  _chooseLayerType = (seriesId) => {
    const metadata = this.props.metadataBySeriesId[seriesId] || {};

    const layerProps = _.extend({
      xDomain: this.props.xDomain,
      yDomain: this.props.yDomainBySeriesId[seriesId],
      data: this.props.dataBySeriesId[seriesId],
      key: seriesId
    }, metadata);

    switch(metadata.chartType) {
      case ChartType.SIMPLE_LINE:
        return <SimpleLineLayer {...layerProps}/>;

      case ChartType.BUCKETED_LINE:
        return <BucketedLineLayer {...layerProps}/>;

      case ChartType.POINT:
        return <PointLayer {...layerProps}/>;

      case ChartType.TIME_SPAN:
        return <TimeSpanLayer {...layerProps}/>;

      default:
        console.warn('not rendering data layer of unknown type ' + metadata.chartType);
        return null;
    }
  }
}

export default MetadataDrivenDataLayer;
