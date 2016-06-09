import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
import propTypes from '../propTypes';
import { computeTicks } from '../renderUtils';
import { Interval, ScaleFunction, Ticks, TickFormat, Color, AxisSpec } from '../interfaces';

const DEFAULT_TICK_COUNT = 5;
// TODO: Do any of these need to be configurable?
const VERTICAL_PADDING = 4;
const HORIZONTAL_PADDING = 6;

export interface Props extends AxisSpec {
  xDomain: Interval;
  font?: string;
}

@PureRender
@NonReactRender
@PixelRatioContext
export default class XAxisLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = _.defaults({
    xDomain: propTypes.interval.isRequired,
    font: React.PropTypes.string
  }, propTypes.axisSpecPartial);

  static defaultProps = {
    scale: d3Scale.scaleTime,
    color: '#444',
    font: '12px sans-serif'
  };

  render() {
    return <PollingResizingCanvasLayer
      ref='canvasLayer'
      onSizeChange={this.nonReactRender}
      pixelRatio={this.context.pixelRatio}
    />;
  }

  nonReactRender = () => {
    const { width, height, context } = (this.refs['canvasLayer'] as PollingResizingCanvasLayer).resetCanvas();

    const xScale = this.props.scale()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    const { ticks, format } = computeTicks(xScale, this.props.ticks, this.props.tickFormat);

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
