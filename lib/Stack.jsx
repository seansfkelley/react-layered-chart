import React from 'react';
import PureRender from 'pure-render-decorator';

import LineLayer from './LineLayer';

@PureRender
class Stack extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };

  render() {
    return (
      // TODO: Make a mixin for the store so that we rerender when state change.
      <div className='stack'>
        {this.props.store.getState().seriesIds.map(this._chooseLayerType.bind(this))}
      </div>
    );
  }

  _chooseLayerType(seriesId) {
    const metadata = this.props.store.getState().seriesMetadataById[seriesId];
    const layerProps = {
      seriesId,
      metadata,
      xDomain: this.props.store.getState().xAxis,
      yDomain: this.props.store.getState().yAxis,
      data: this.props.store.getState().seriesDataById[seriesId]
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
