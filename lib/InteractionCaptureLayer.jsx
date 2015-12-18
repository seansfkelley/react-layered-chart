import React from 'react';
import ReactDOM from 'react-dom';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';

const MAC_TRACKPAD_ZOOM_FACTOR = 0.05;
const LEFT_MOUSE_BUTTON = 0;

@PureRender
class InteractionCaptureLayer extends React.Component {
  static propTypes = {
    onZoom: React.PropTypes.func,
    onPan: React.PropTypes.func,
    onBrush: React.PropTypes.func,
    xDomain: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    }).isRequired
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
    if (this.props.onPan && event.shiftKey && event.button === LEFT_MOUSE_BUTTON) {
      this.setState({ isPanning: true, lastPanClientX: event.clientX });
    } else if (this.props.onBrush && event.button === LEFT_MOUSE_BUTTON) {
      this.setState({ isBrushing: true, startBrushClientX: event.clientX });
    }
  };

  _dispatchPanAndBrushEvents(event) {
    const boundingClientRect = this._getBoundingClientRect();
    const scale = d3.scale.linear()
      .domain([ 0, boundingClientRect.width ])
      .range([ this.props.xDomain.start, this.props.xDomain.end ]);

    if (this.props.onPan && this.state.isPanning) {
      this.setState({ lastPanClientX: event.clientX });
      this.props.onPan(scale(this.state.lastPanClientX) - scale(event.clientX));
    } else if (this.props.onBrush && this.state.isBrushing) {
      if (Math.abs(this.state.startBrushClientX - event.clientX) > 2) {
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
    if (this.props.onZoom && event.shiftKey && event.deltaY) {
      const boundingClientRect = this._getBoundingClientRect();
      const focus = (event.clientX - boundingClientRect.left) / boundingClientRect.width;
      this.props.onZoom(1 + (-event.deltaY * MAC_TRACKPAD_ZOOM_FACTOR), focus);
    }
  };
}

export default InteractionCaptureLayer;
