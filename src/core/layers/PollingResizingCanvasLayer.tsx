import * as React from 'react';

export interface Props {
  onSizeChange: () => void;
  pixelRatio?: number;
}

export interface State {
  width: number;
  height: number;
}

export default class PollingResizingCanvasLayer extends React.PureComponent<Props, State> {
  private __setSizeInterval: number;

  static propTypes = {
    onSizeChange: React.PropTypes.func.isRequired,
    pixelRatio: React.PropTypes.number
  } as React.ValidationMap<Props>;

  static defaultProps = {
    pixelRatio: 1
  } as any as Props;

  state = {
    width: 0,
    height: 0
  };

  render() {
    return (
      <canvas
        className='lc-polling-resizing-canvas-layer'
        ref='canvas'
        width={this.state.width * this.props.pixelRatio!}
        height={this.state.height * this.props.pixelRatio!}
      />
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

  resetCanvas() {
    const canvas = this.getCanvasElement();
    const { width, height } = this.state;
    const context = canvas.getContext('2d')!;

    context.setTransform(1, 0, 0, 1, 0, 0); // Same as resetTransform, but actually part of the spec.
    context.scale(this.props.pixelRatio!, this.props.pixelRatio!);
    context.clearRect(0, 0, width, height);

    return { width, height, context };
  }

  componentDidUpdate() {
    this.props.onSizeChange();
  }

  componentDidMount() {
    this._setSizeFromDom();
    this.__setSizeInterval = setInterval(this._setSizeFromDom.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.__setSizeInterval);
  }

  private _setSizeFromDom() {
    const wrapper = this.refs['canvas'] as HTMLElement;
    this.setState({
      width: wrapper.offsetWidth,
      height: wrapper.offsetHeight
    });
  }
}
