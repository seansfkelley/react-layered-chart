import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getIndexBoundsForPointData } from '../renderUtils';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import propTypes from '../propTypes';
import { Interval, PointDatum, ScaleFunction, Color } from '../interfaces';

export interface Props {
  data: PointDatum[];
  xDomain: Interval;
  yDomain: Interval;
  yScale?: ScaleFunction;
  color?: Color;
}

@PureRender
@NonReactRender
@PixelRatioContext
class SimpleLineLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.pointDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    yDomain: propTypes.interval.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string
  } as React.ValidationMap<Props>;

  static defaultProps = {
    yScale: d3Scale.scaleLinear,
    color: 'rgba(0, 0, 0, 0.7)'
  } as any as Props;

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.nonReactRender}/>;
  }

  nonReactRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(
      this.refs['canvasLayer'] as AutoresizingCanvasLayer,
      this.context.pixelRatio
    );

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    const { firstIndex, lastIndex } = getIndexBoundsForPointData(this.props.data, this.props.xDomain, 'xValue');
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3Scale.scaleLinear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .rangeRound([ 0, height ]);

    context.beginPath();

    context.moveTo(xScale(this.props.data[firstIndex].xValue), height - yScale(this.props.data[firstIndex].yValue));
    for (let i = firstIndex + 1; i < lastIndex; ++i) {
      context.lineTo(xScale(this.props.data[i].xValue), height - yScale(this.props.data[i].yValue));
    }

    context.strokeStyle = this.props.color;
    context.stroke();
  };
}

export default wrapWithAnimatedYDomain(SimpleLineLayer);
