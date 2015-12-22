import React from 'react';
import PureRender from 'pure-render-decorator';

import BucketedLineLayer from './BucketedLineLayer';
import PointLayer from './PointLayer';
import SimpleLineLayer from './SimpleLineLayer';
import TimeSpanLayer from './TimeSpanLayer';

import SelectFromStore from '../mixins/SelectFromStore';
import ChartType from '../ChartType';

@PureRender
@SelectFromStore
class MetadataDrivenDataLayer extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired,
    seriesIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  };

  static selectFromStore = {
    xAxis: 'xAxis',
    seriesYAxisById: 'seriesYAxisById',
    seriesMetadataById: 'seriesMetadataById',
    seriesDataById: 'seriesDataById'
  };

  render() {
    return (
      <div className='layer metadata-driven-data-layer'>
        {this.props.seriesIds.map(this._chooseLayerType.bind(this))}
      </div>
    );
  }

  _chooseLayerType(seriesId) {
    const metadata = this.state.seriesMetadataById[seriesId] || {};

    const layerProps = {
      xDomain: this.state.xAxis,
      yDomain: this.state.seriesYAxisById[seriesId],
      data: this.state.seriesDataById[seriesId],
      stroke: metadata.stroke,
      fill: metadata.fill,
      key: seriesId
    };

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
