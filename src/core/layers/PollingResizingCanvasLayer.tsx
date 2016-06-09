import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as classNames from 'classnames';

export interface Props {
  onSizeChange: () => void;
  pixelRatio?: number;
  className?: string;
}

export interface State {
  width: number;
  height: number;
}

@PureRender
export default class PollingResizingCanvasLayer extends React.Component<Props, State> {
  private __setSizeInterval: number;

  static propTypes = {
    onSizeChange: React.PropTypes.func.isRequired,
    className: React.PropTypes.string
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
      <div className={classNames('resizing-wrapper', this.props.className)} ref='wrapper'>
        <canvas
          className='canvas'
          ref='canvas'
          width={this.state.width * this.props.pixelRatio}
          height={this.state.height * this.props.pixelRatio}
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

  resetCanvas() {
    const canvas = this.getCanvasElement();
    const { width, height } = this.state;
    const context = canvas.getContext('2d');

    context.setTransform(1, 0, 0, 1, 0, 0); // Same as resetTransform, but actually part of the spec.
    context.scale(this.props.pixelRatio, this.props.pixelRatio);
    context.clearRect(0, 0, width, height);
    // TODO: I think this might have to be multiplied by pixelRatio to properly un-blur the canvas.
    context.translate(0.5, 0.5);

    return { width, height, context };
  }

  componentDidUpdate() {
    this.props.onSizeChange();
  }

  componentDidMount() {
    this._setSizeFromWrapper();
    this.__setSizeInterval = setInterval(this._setSizeFromWrapper.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.__setSizeInterval);
  }

  private _setSizeFromWrapper() {
    const wrapper = this.refs['wrapper'] as HTMLElement;
    this.setState({
      width: wrapper.offsetWidth,
      height: wrapper.offsetHeight
    });
  }
}
