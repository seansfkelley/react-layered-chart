import React from 'react';
import PureRender from 'pure-render-decorator';

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
    yAxis: 'yAxis',
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
      yDomain: this.state.yAxis,
      data: this.state.seriesDataById[seriesId],
      stroke: metadata.stroke,
      fill: metadata.fill,
      key: seriesId
    };

    switch(metadata.chartType) {
      case ChartType.SIMPLE_LINE:
        return <SimpleLineLayer {...layerProps}/>;

      case ChartType.TIME_SPAN:
        return <TimeSpanLayer {...layerProps}/>;

      default:
        return null;
    }
  }
}

export default MetadataDrivenDataLayer;
