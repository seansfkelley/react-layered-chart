import React from 'react';
import ReactDOM from 'react-dom';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';

import propTypes from '../propTypes';

const MAC_TRACKPAD_ZOOM_FACTOR = 0.05;
const LEFT_MOUSE_BUTTON = 0;

@PureRender
class InteractionCaptureLayer extends React.Component {
  static propTypes = {
    onZoom: React.PropTypes.func,
    onPan: React.PropTypes.func,
    onBrush: React.PropTypes.func,
    onHover: React.PropTypes.func,
    xDomain: propTypes.domain.isRequired
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

  _createPhysicalToLogicalXScale() {
    const boundingClientRect = this._getBoundingClientRect();
    return d3Scale.linear()
      .domain([ boundingClientRect.left, boundingClientRect.right ])
      .range([ this.props.xDomain.start, this.props.xDomain.end ]);
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
        this.props.onBrush({ start: Math.min(a, b), end: Math.max(a, b) });
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
    if (this.props.onPan && event.shiftKey && event.button === LEFT_MOUSE_BUTTON) {
      this.setState({ isPanning: true, lastPanClientX: event.clientX });
    } else if (this.props.onBrush && event.button === LEFT_MOUSE_BUTTON) {
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
    if (this.props.onZoom && event.shiftKey && event.deltaY) {
      const boundingClientRect = this._getBoundingClientRect();
      const focus = (event.clientX - boundingClientRect.left) / boundingClientRect.width;
      this.props.onZoom(1 + (-event.deltaY * MAC_TRACKPAD_ZOOM_FACTOR), focus);
    }
    event.stopPropagation();
  };
}

export default InteractionCaptureLayer;
