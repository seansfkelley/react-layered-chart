import React from 'react';
import PureRender from 'pure-render-decorator';

import LineLayer from './LineLayer';
import SelectFromStore from './SelectFromStore';

@PureRender
@SelectFromStore
class Stack extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };

  static selectFromStore = {
    seriesIds: 'seriesIds',
    xAxis: 'xAxis',
    yAxis: 'yAxis',
    seriesMetadataById: 'seriesMetadataById',
    seriesDataById: 'seriesDataById'
  };

  render() {
    return (
      // TODO: Make a mixin for the store so that we rerender when state change.
      <div className='stack'>
        {this.state.seriesIds.map(this._chooseLayerType.bind(this))}
      </div>
    );
  }

  _chooseLayerType(seriesId) {
    const metadata = this.state.seriesMetadataById[seriesId];
    const layerProps = {
      seriesId,
      metadata,
      xDomain: this.state.xAxis,
      yDomain: this.state.yAxis,
      data: this.state.seriesDataById[seriesId],
      key: seriesId
    };

    switch((metadata || {}).chartType) {
      case 'line':
        return <LineLayer {...layerProps}/>;

      default:
        return null;
    }
  }
}

export default Stack;
