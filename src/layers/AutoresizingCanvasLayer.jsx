import React from 'react';
import PureRender from 'pure-render-decorator';
import classnames from 'classnames';

import { decorator as PixelRatioContext } from '../mixins/PixelRatioContext';

@PureRender
@PixelRatioContext
class AutoresizingCanvasLayer extends React.Component {
  static propTypes = {
    onSizeChange: React.PropTypes.func.isRequired,
    className: React.PropTypes.string
  };

  static resetCanvas(canvasLayer, pixelRatio = 1) {
    const canvas = canvasLayer.getCanvasElement();
    const { width, height } = canvasLayer.getDimensions();
    const context = canvas.getContext('2d');

    context.resetTransform();
    context.scale(pixelRatio, pixelRatio);
    context.clearRect(0, 0, width, height);
    context.translate(0.5, 0.5);

    return { width, height, context };
  }

  state = {
    width: 0,
    height: 0
  };

  render() {
    const pixelRatio = this.context.pixelRatio || 1;
    return (
      <div className={classnames('layer resizing-wrapper', this.props.className)} ref='wrapper'>
        <canvas
          className='canvas'
          ref='canvas'
          width={this.state.width * pixelRatio}
          height={this.state.height * pixelRatio}
          style={{ width: this.state.width, height: this.state.height }}
        />
      </div>
    );
  }

  getCanvasElement() {
    return this.refs.canvas;
  }

  getDimensions() {
    return {
      width: this.state.width,
      height: this.state.height
    };
  }

  componentDidUpdate() {
    this.props.onSizeChange();
  }

  componentDidMount() {
    this.setSizeFromWrapper();
    this.__setSizeInterval = setInterval(this.setSizeFromWrapper.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.__setSizeInterval);
  }

  setSizeFromWrapper() {
    this.setState({
      width: this.refs.wrapper.offsetWidth,
      height: this.refs.wrapper.offsetHeight
    });
  }
}

export default AutoresizingCanvasLayer;
