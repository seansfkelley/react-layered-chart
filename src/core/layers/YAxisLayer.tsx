import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import propTypes from '../propTypes';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import { Range, ScaleFunction, Ticks, TickFormat, Color } from '../interfaces';

// TODO: Do any of these need to be configurable?
const HORIZONTAL_PADDING = 6;
const TICK_LENGTH = 4;
const DEFAULT_COLOR = '#444';
const DEFAULT_TICK_COUNT = 5;

export interface YAxisSpec {
  yDomain: Range;
  scale?: ScaleFunction;
  ticks?: Ticks;
  tickFormat?: TickFormat;
  color?: Color;
}

interface YAxisProps extends YAxisSpec {
  font?: string;
  backgroundColor?: Color;
}

interface YAxisState {
  width: number;
  height: number;
}

@PureRender
@NonReactRender
@PixelRatioContext
class YAxis extends React.Component<YAxisProps, YAxisState> {
  context: Context;

  private __setSizeInterval: number;

  state = {
    width: 0,
    height: 0
  };

  render() {
    const pixelRatio = this.context.pixelRatio || 1;
    return (
      <div className='single-y-axis' ref='wrapper'>
        <canvas
          ref='canvas'
          width={this.state.width * pixelRatio}
          height={this.state.height * pixelRatio}
          style={{ width: this.state.width, height: this.state.height }}
        />
      </div>
    );
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
      height: wrapper.offsetHeight
    } as any);
  }

  // This is lifted almost direcly from AutoresizingCanvasLayer.
  private _resetCanvas() {
    const pixelRatio = this.context.pixelRatio || 1;
    const canvas = this.refs['canvas'] as HTMLCanvasElement;
    const { width, height } = this.state;
    const context = canvas.getContext('2d');

    context.setTransform(1, 0, 0, 1, 0, 0); // Same as resetTransform, but actually part of the spec.
    context.scale(pixelRatio, pixelRatio);
    context.clearRect(0, 0, width, height);
    // TODO: I think this might have to be multiplied by pixelRatio to properly un-blur the canvas.
    context.translate(0.5, 0.5);

    context.textAlign = 'end';
    context.textBaseline = 'middle';
    context.font = this.props.font;

    return { width, height, context };
  }

  nonReactRender = () => {
    const { width, height, context } = this._resetCanvas();

    const yScale = (this.props.scale || d3Scale.scaleLinear)()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .rangeRound([ 0, height ]);

    let ticks: number[];
    const inputTicks = this.props.ticks;
    if (inputTicks) {
      if (_.isFunction(inputTicks)) {
        ticks = inputTicks(this.props.yDomain);
      } else if (_.isArray<number>(inputTicks)) {
        ticks = inputTicks;
      } else if (_.isNumber(inputTicks)) {
        ticks = yScale.ticks(inputTicks);
      } else {
        throw new Error('ticks must be a function, array or number');
      }
    } else {
      ticks = yScale.ticks(DEFAULT_TICK_COUNT);
    }
    const tickCount = _.isNumber(inputTicks) ? inputTicks : DEFAULT_TICK_COUNT;
    const format = yScale.tickFormat(tickCount, this.props.tickFormat);

    const maxTextWidth = Math.ceil(_.max(ticks.map(t => context.measureText(format(t)).width)));
    const maxAxisWidth = maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH;

    // It's pretty goofy that we can do this during rendering.
    this.setState({ width: maxAxisWidth } as any);

    context.beginPath();
    // -0.5 to undo the translation, cause it seems to leave a gap.
    context.rect(-0.5, -0.5, maxAxisWidth, height);
    context.fillStyle = this.props.backgroundColor;
    context.fill();

    context.beginPath();
    context.fillStyle = context.strokeStyle = (this.props.color || DEFAULT_COLOR);
    for (let i = 0; i < ticks.length; ++i) {
      const yOffset = height - yScale(ticks[i]);

      context.fillText(format(ticks[i]), maxTextWidth + HORIZONTAL_PADDING, yOffset);

      context.moveTo(maxTextWidth + HORIZONTAL_PADDING * 2, yOffset);
      context.lineTo(maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, yOffset)
    }

    // -0.5 to undo the translation, cause it doesn't seem to render otherwise.
    context.moveTo(maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH - 0.5, 0);
    context.lineTo(maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH - 0.5, height)

    context.stroke();
  };
}

const AnimatedYAxis = wrapWithAnimatedYDomain(YAxis);

export interface Props {
  axes: YAxisSpec[];
  font?: string;
  backgroundColor?: Color;
}

@PureRender
export default class YAxisLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    axes: React.PropTypes.arrayOf(React.PropTypes.shape({
      yDomain: propTypes.range.isRequired,
      scale: React.PropTypes.func,
      ticks: React.PropTypes.oneOfType([
        React.PropTypes.func,
        React.PropTypes.number,
        React.PropTypes.arrayOf(React.PropTypes.number)
      ]),
      tickFormat: React.PropTypes.oneOfType([
        React.PropTypes.func,
        React.PropTypes.string
      ]),
      color: React.PropTypes.string
    })).isRequired,
    font: React.PropTypes.string,
    backgroundColor: React.PropTypes.string
  };

  static defaultProps = {
    font: '12px sans-serif',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  };

  render() {
    return (
      <div className='y-axis-container'>
        {this.props.axes.map(axis =>
          <AnimatedYAxis {...axis} font={this.props.font} backgroundColor={this.props.backgroundColor}/>)
        }
      </div>
    );
  }
}
