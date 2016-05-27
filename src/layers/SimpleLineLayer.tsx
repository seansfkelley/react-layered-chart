import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import CanvasRender from '../decorators/CanvasRender';
import AnimateProps from '../decorators/AnimateProps';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getBoundsForInstantaeousData } from '../util';
import propTypes from '../propTypes';
import { Range, TimestampDatum, ScaleFunction, Color } from '../interfaces';

export interface Props {
  data: TimestampDatum[];
  xDomain: Range;
  yDomain: Range;
  yScale?: ScaleFunction;
  color?: Color;
}

export interface State {
  animated_yDomain: Range;
}

@PureRender
@CanvasRender
@AnimateProps
@PixelRatioContext
export default class SimpleLineLayer extends React.Component<Props, State> {
  context: Context;

  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.dataPoint).isRequired,
    xDomain: propTypes.range.isRequired,
    yDomain: propTypes.range.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string
  };

  static defaultProps = {
    yScale: d3Scale.scaleLinear,
    color: 'rgba(0, 0, 0, 0.7)'
  };

  animatedProps = {
    yDomain: 1000
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(
      this.refs['canvasLayer'] as AutoresizingCanvasLayer,
      this.context.pixelRatio
    );

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    const { firstIndex, lastIndex } = getBoundsForInstantaeousData(this.props.data, this.props.xDomain);
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3Scale.scaleLinear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.state.animated_yDomain.min, this.state.animated_yDomain.max ])
      .rangeRound([ 0, height ]);

    context.beginPath();

    context.moveTo(xScale(this.props.data[firstIndex].timestamp), height - yScale(this.props.data[firstIndex].value));
    for (let i = firstIndex + 1; i < lastIndex; ++i) {
      context.lineTo(xScale(this.props.data[i].timestamp), height - yScale(this.props.data[i].value));
    }

    context.strokeStyle = this.props.color;
    context.stroke();
  };
}
