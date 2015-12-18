import React from 'react';
import PureRender from 'pure-render-decorator';

import SelectFromStore from './SelectFromStore';
import Stack from './Stack';
import BrushLayer from './BrushLayer';
import InteractionCaptureLayer from './InteractionCaptureLayer';

import ActionType from './ActionType';
import Actions from './Actions';

@PureRender
@SelectFromStore
class DefaultChart extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };

  static selectFromStore = {
    seriesIds: 'seriesIds',
    xAxis: 'xAxis',
    selection: 'selection'
  };

  render() {
    return (
      <Stack store={this.props.store} seriesIds={this.state.seriesIds}>
        <BrushLayer
          xDomain={this.state.xAxis}
          selection={this.state.selection}
        />
        <InteractionCaptureLayer
          xDomain={this.state.xAxis}
          onPan={this._onPan}
          onZoom={this._onZoom}
          onBrush={this._onBrush}
        />
      </Stack>
    );
  }

  _onPan = (deltaX) => {
    this.props.store.dispatch(Actions.pan(deltaX));
  };

  _onZoom = (factor, focus) => {
    this.props.store.dispatch(Actions.zoom(factor, focus));
  };

  _onBrush = (brush) => {
    this.props.store.dispatch(Actions.brush(brush));
  };
}

export default DefaultChart;
