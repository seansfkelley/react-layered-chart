import React from 'react';
import ReactDOM from 'react-dom';
import PureRender from 'pure-render-decorator';

import ActionType from './ActionType';
import SelectFromStore from './SelectFromStore';
import Actions from './Actions';
import d3 from 'd3';

const MAC_TRACKPAD_ZOOM_FACTOR = 0.05;
const LEFT_MOUSE_BUTTON = 0;

@PureRender
@SelectFromStore
class InteractionCaptureLayer extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired,
    enableZoom: React.PropTypes.bool,
    enablePan: React.PropTypes.bool,
    enableBrush: React.PropTypes.bool
  };

  static defaultProps = {
    enableZoom: true,
    enablePan: true,
    enableBrush: true
  };

  static selectFromStore = {
    xAxis: 'xAxis'
  };

  state = {
    isPanning: false,
    isBrushing: false,
    lastPanClientX: null,
    startBrushClientX: null
  };

  render() {
    return (
      <div
        className='layer interaction-capture'
        onMouseDown={this._onMouseDown}
        onMouseUp={this._onMouseUp}
        onMouseMove={this._onMouseMove}
        onMouseLeave={this._onMouseLeave}
        onWheel={this._onWheel}
        ref='layer'
      />
    );
  }

  _getBoundingClientRect() {
    return ReactDOM.findDOMNode(this.refs.layer).getBoundingClientRect();
  }

  _onMouseDown = (event) => {
    if (this.props.enablePan && event.shiftKey && event.button === LEFT_MOUSE_BUTTON) {
      this.setState({ isPanning: true, lastPanClientX: event.clientX });
    } else if (this.props.enableBrush && event.button === LEFT_MOUSE_BUTTON) {
      this.setState({ isBrushing: true, startBrushClientX: event.clientX });
    }
  };

  _dispatchPanAndBrushEvents(event) {
    const boundingClientRect = this._getBoundingClientRect();
    const scale = d3.scale.linear()
      .domain([ 0, boundingClientRect.width ])
      .range([ this.state.xAxis.start, this.state.xAxis.end ]);

    if (this.state.isPanning) {
      this.props.store.dispatch(Actions.pan(scale(this.state.lastPanClientX) - scale(event.clientX)));
      this.setState({ lastPanClientX: event.clientX });
    } else if (this.state.isBrushing) {
      this.props.store.dispatch(Actions.brush(scale(this.state.startBrushClientX), scale(event.clientX)));
    }
  }

  _clearPanAndBrushState() {
    this.setState({
      isPanning: false,
      isBrushing: false,
      lastPanClientX: null,
      startBrushClientX: null
    });
  }

  _onMouseUp = (event) => {
    this._dispatchPanAndBrushEvents(event);
    this._clearPanAndBrushState();
  };

  _onMouseMove = (event) => {
    this._dispatchPanAndBrushEvents(event);
  };

  _onMouseLeave = (event) => {
    this._dispatchPanAndBrushEvents(event);
    this._clearPanAndBrushState();
  };

  _onWheel = (event) => {
    if (this.props.enableZoom && event.shiftKey) {
      const boundingClientRect = this._getBoundingClientRect();
      if (event.deltaY) {
        const focus = (event.clientX - boundingClientRect.left) / boundingClientRect.width;
        this.props.store.dispatch(Actions.zoom(1 + (-event.deltaY * MAC_TRACKPAD_ZOOM_FACTOR), focus));
      }
      if (event.deltaX) {
        // Scroll left/right...
      }
    }
  };
}

export default InteractionCaptureLayer;
