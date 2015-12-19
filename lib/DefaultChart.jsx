import React from 'react';
import PureRender from 'pure-render-decorator';

import SelectFromStore from './mixins/SelectFromStore';
import Stack from './Stack';
import BrushLayer from './layers/BrushLayer';
import InteractionCaptureLayer from './layers/InteractionCaptureLayer';
import HoverLayer from './layers/HoverLayer';

import ActionType from './flux/ActionType';
import Actions from './flux/Actions';

@PureRender
@SelectFromStore
class DefaultChart extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };

  static selectFromStore = {
    seriesIds: 'seriesIds',
    xAxis: 'xAxis',
    selection: 'selection',
    hover: 'hover'
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
          onHover={this._onHover}
          onPan={this._onPan}
          onZoom={this._onZoom}
          onBrush={this._onBrush}
        />
        <HoverLayer
          xDomain={this.state.xAxis}
          hover={this.state.hover}
        />
      </Stack>
    );
  }

  _onHover = (xPos) => {
    this.props.store.dispatch(Actions.hover(xPos));
  };

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
