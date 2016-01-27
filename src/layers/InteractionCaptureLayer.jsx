import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';

import propTypes from '../propTypes';

const MAC_TRACKPAD_ZOOM_FACTOR = 0.05;
const LEFT_MOUSE_BUTTON = 0;

@PureRender
class InteractionCaptureLayer extends React.Component {
  static propTypes = {
    shouldZoom: React.PropTypes.func,
    shouldPan: React.PropTypes.func,
    shouldBrush: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onPan: React.PropTypes.func,
    onBrush: React.PropTypes.func,
    onHover: React.PropTypes.func,
    xDomain: propTypes.range.isRequired
  };

  static defaultProps = {
    shouldZoom: (event) => event.shiftKey,
    shouldPan: (event) => event.shiftKey && event.button === LEFT_MOUSE_BUTTON,
    shouldBrush: (event) => !event.shiftKey && event.button === LEFT_MOUSE_BUTTON
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
    return this.refs.layer.getBoundingClientRect();
  }

  _createPhysicalToLogicalXScale() {
    const boundingClientRect = this._getBoundingClientRect();
    return d3Scale.linear()
      .domain([ boundingClientRect.left, boundingClientRect.right ])
      .range([ this.props.xDomain.min, this.props.xDomain.max ]);
  }

  _dispatchPanAndBrushEvents(event) {
    if (this.props.onPan && this.state.isPanning) {
      const scale = this._createPhysicalToLogicalXScale();
      this.setState({ lastPanClientX: event.clientX });
      this.props.onPan(scale(this.state.lastPanClientX) - scale(event.clientX));
    } else if (this.props.onBrush && this.state.isBrushing) {
      if (Math.abs(this.state.startBrushClientX - event.clientX) > 2) {
        const scale = this._createPhysicalToLogicalXScale();
        const a = scale(this.state.startBrushClientX);
        const b = scale(event.clientX);
        this.props.onBrush({ min: Math.min(a, b), max: Math.max(a, b) });
      } else {
        this.props.onBrush(null);
      }
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

  _onMouseDown = (event) => {
    if (this.props.onPan && this.props.shouldPan(event)) {
      this.setState({ isPanning: true, lastPanClientX: event.clientX });
    } else if (this.props.onBrush && this.props.shouldBrush(event)) {
      this.setState({ isBrushing: true, startBrushClientX: event.clientX });
    }
    event.stopPropagation();
  };

  _onMouseUp = (event) => {
    this._dispatchPanAndBrushEvents(event);
    this._clearPanAndBrushState();
    event.stopPropagation();
  };

  _onMouseMove = (event) => {
    this._dispatchPanAndBrushEvents(event);
    if (this.props.onHover) {
      const scale = this._createPhysicalToLogicalXScale();
      this.props.onHover(scale(event.clientX));
    }
    event.stopPropagation();
  };

  _onMouseLeave = (event) => {
    this._dispatchPanAndBrushEvents(event);
    this._clearPanAndBrushState();
    if (this.props.onHover) {
      this.props.onHover(null);
    }
    event.stopPropagation();
  };

  _onWheel = (event) => {
    if (this.props.onZoom && event.deltaY && this.props.shouldZoom(event)) {
      const boundingClientRect = this._getBoundingClientRect();
      const focus = (event.clientX - boundingClientRect.left) / boundingClientRect.width;
      this.props.onZoom(1 + (-event.deltaY * MAC_TRACKPAD_ZOOM_FACTOR), focus);
      event.preventDefault();
    }
    event.stopPropagation();
  };
}

export default InteractionCaptureLayer;
