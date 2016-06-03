import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as classnames from 'classnames';

import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

export interface Props {
  onSizeChange: () => void;
  className?: string;
}

export interface State {
  width: number;
  height: number;
}

@PureRender
@PixelRatioContext
export default class AutoresizingCanvasLayer extends React.Component<Props, State> {
  context: Context;

  private __setSizeInterval: number;

  static propTypes = {
    onSizeChange: React.PropTypes.func.isRequired,
    className: React.PropTypes.string
  };

  static resetCanvas(canvasLayer: AutoresizingCanvasLayer, pixelRatio: number = 1) {
    const canvas = canvasLayer.getCanvasElement();
    const { width, height } = canvasLayer.getDimensions();
    const context = canvas.getContext('2d');

    context.setTransform(1, 0, 0, 1, 0, 0); // Same as resetTransform, but actually part of the spec.
    context.scale(pixelRatio, pixelRatio);
    context.clearRect(0, 0, width, height);
    // TODO: I think this might have to be multiplied by pixelRatio to properly un-blur the canvas.
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
      <div className={classnames('resizing-wrapper', this.props.className)} ref='wrapper'>
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
    return this.refs['canvas'] as HTMLCanvasElement;
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
    const wrapper = this.refs['wrapper'] as HTMLElement;
    this.setState({
      width: wrapper.offsetWidth,
      height: wrapper.offsetHeight
    });
  }
}
