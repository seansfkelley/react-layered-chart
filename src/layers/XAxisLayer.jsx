import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import { decorator as CanvasRender } from '../mixins/CanvasRender';
import { decorator as PixelRatioContext } from '../mixins/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';

// TODO: Do any of these need to be configurable?
const VERTICAL_PADDING = 4;
const HORIZONTAL_PADDING = 6;
const DEFAULT_TICK_COUNT = 5;

@PureRender
@CanvasRender
@PixelRatioContext
export default class XAxisLayer extends React.Component {
  static propTypes = {
    xDomain: propTypes.range.isRequired,
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
    color: React.PropTypes.string,
    font: React.PropTypes.string
  };

  static defaultProps = {
    scale: d3Scale.time,
    color: '#444',
    font: '12px sans-serif'
  };

  render() {
    return <AutoresizingCanvasLayer
      className='x-axis'
      ref='canvasLayer'
      onSizeChange={this.canvasRender}
    />;
  }

  canvasRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(this.refs.canvasLayer, this.context.pixelRatio);

    const xScale = this.props.scale()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    let ticks;
    const inputTicks = this.props.ticks;
    if (inputTicks) {
      if (_.isFunction(inputTicks)) {
        ticks = inputTicks(xDomain);
      } else if (_.isArray(inputTicks)) {
        ticks = inputTicks;
      } else if (_.isNumber(inputTicks)) {
        ticks = xScale.ticks(inputTicks);
      } else {
        throw new Error('ticks must be a function, array or number');
      }
    } else {
      ticks = xScale.ticks(DEFAULT_TICK_COUNT);
    }
    const format = xScale.tickFormat(
      _.isNumber(inputTicks) ? inputTicks : DEFAULT_TICK_COUNT,
      this.props.tickFormat
    );

    context.beginPath();

    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillStyle = this.props.color;
    context.font = this.props.font;

    for (let i = 0; i < ticks.length; ++i) {
      const xOffset = xScale(ticks[i]);

      context.fillText(format(ticks[i]).toUpperCase(),  xOffset + HORIZONTAL_PADDING, VERTICAL_PADDING);

      context.moveTo(xOffset, 0);
      context.lineTo(xOffset, height)
    }

    context.strokeStyle = this.props.color;
    context.stroke();
  };
}
