import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import CanvasRender from '../decorators/CanvasRender';
import AnimateProps from '../decorators/AnimateProps';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';
import { Range, ScaleFunction, Ticks, TickFormat, Color } from '../interfaces';

// TODO: Do any of these need to be configurable?
const HORIZONTAL_PADDING = 6;
const TICK_LENGTH = 4;
const DEFAULT_COLOR = '#444';
const DEFAULT_TICK_COUNT = 5;

export interface Props {
  yDomains: Range[];
  scales?: ScaleFunction[];
  ticks?: Ticks[];
  tickFormats?: TickFormat[];
  colors?: Color[];
  font?: string;
  backgroundColor?: Color;
}

export interface State {
  animated_yDomains: Range[];
}

@PureRender
@CanvasRender
@AnimateProps
@PixelRatioContext
export default class YAxisLayer extends React.Component<Props, State> {
  context: Context;

  static propTypes = {
    // This awkward index-matching is because animation only supports animating top-level keys and we don't
    // want to animate a bunch of extraneous metadata.
    yDomains: React.PropTypes.arrayOf(propTypes.range).isRequired,
    scales: React.PropTypes.arrayOf(React.PropTypes.func),
    ticks: React.PropTypes.arrayOf(React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.number,
      React.PropTypes.arrayOf(React.PropTypes.number)
    ])),
    tickFormats: React.PropTypes.arrayOf(React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.string
    ])),
    colors: React.PropTypes.arrayOf(React.PropTypes.string),
    font: React.PropTypes.string,
    backgroundColor: React.PropTypes.string
  };

  static defaultProps = {
    colors: [],
    font: '12px sans-serif',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  };

  animatedProps = {
    yDomains: 1000
  };

  render() {
    return <AutoresizingCanvasLayer
      className='y-axis'
      ref='canvasLayer'
      onSizeChange={this.canvasRender}
    />;
  }

  canvasRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(
      this.refs['canvasLayer'] as AutoresizingCanvasLayer,
      this.context.pixelRatio
    );

    context.textAlign = 'end';
    context.textBaseline = 'middle';
    context.font = this.props.font;

    let xOffset = 0;
    this.state.animated_yDomains.forEach((yDomain, i) => {
      const scaleFn = (this.props.scales || [])[i] || d3Scale.scaleLinear;
      const yScale = scaleFn()
        .domain([ yDomain.min, yDomain.max ])
        .rangeRound([ 0, height ]);

      let ticks: number[];
      const inputTicks = _.get(this, [ 'props', 'ticks', i ]);
      if (inputTicks) {
        if (_.isFunction(inputTicks)) {
          ticks = inputTicks(yDomain);
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
      const inputFormat = _.get(this, [ 'props', 'tickFormats', i ]);
      const format = yScale.tickFormat(_.isNumber(inputTicks) ? inputTicks : DEFAULT_TICK_COUNT, inputFormat);

      const maxTextWidth = Math.ceil(_.max(ticks.map(t => context.measureText(format(t)).width)));
      const maxAxisWidth = maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH;

      // This could be done once at the beginning, but it would require a lot of saving-off stuff
      // and doing it piecemeal like this ends up with the same result.
      context.beginPath();
      context.rect(xOffset, 0, maxAxisWidth, height);
      context.fillStyle = this.props.backgroundColor;
      context.fill();

      context.beginPath();
      context.fillStyle = context.strokeStyle = (this.props.colors[i] || DEFAULT_COLOR);
      for (let i = 0; i < ticks.length; ++i) {
        const yOffset = height - yScale(ticks[i]);

        context.fillText(format(ticks[i]), xOffset + maxTextWidth + HORIZONTAL_PADDING, yOffset);

        context.moveTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2, yOffset);
        context.lineTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, yOffset)
      }

      context.moveTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, 0);
      context.lineTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, height)

      context.stroke();

      xOffset += maxAxisWidth;
    });
  };
}
