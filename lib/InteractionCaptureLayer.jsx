import React from 'react';
import ReactDOM from 'react-dom';
import PureRender from 'pure-render-decorator';

import ActionType from './ActionType';
import Actions from './Actions';

const MAC_TRACKPAD_ZOOM_FACTOR = 0.05;

@PureRender
class InteractionCaptureLayer extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };

  render() {
    return (
      <div
        className='layer interaction-capture'
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

  _onMouseMove = (event) => {
    const boundingClientRect = this._getBoundingClientRect();
    this.props.store.dispatch({
      type: ActionType.SET_CURSOR,
      payload: {
        x: event.clientX - boundingClientRect.left,
        y: event.clientY - boundingClientRect.top
      }
    });
  };

  _onMouseLeave = (event) => {
    this.props.store.dispatch({
      type: ActionType.SET_CURSOR,
      payload: null
    });
  };

  _onWheel = (event) => {
    if (event.shiftKey) {
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
