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
  radius?: number;
  innerRadius?: number;
}

@PureRender
@NonReactRender
@PixelRatioContext
class PointLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.pointDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    yDomain: propTypes.interval.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string,
    radius: React.PropTypes.number,
    innerRadius: React.PropTypes.number
  } as React.ValidationMap<Props>;

  static defaultProps = {
    yScale: d3Scale.scaleLinear,
    color: 'rgba(0, 0, 0, 0.7)',
    radius: 3,
    innerRadius: 0
  } as any as Props;

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.nonReactRender}/>;
  }

  nonReactRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(
      this.refs['canvasLayer'] as AutoresizingCanvasLayer,
      this.context.pixelRatio
    );

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

    const isFilled = this.props.innerRadius === 0;

    const radius = isFilled ? this.props.radius : (this.props.radius - this.props.innerRadius) / 2 + this.props.innerRadius;

    context.lineWidth = this.props.radius - this.props.innerRadius;
    context.strokeStyle = this.props.color;
    context.fillStyle = this.props.color;
    context.beginPath();
    for (let i = firstIndex; i < lastIndex; ++i) {
      const x = xScale(this.props.data[i].xValue);
      const y = height - yScale(this.props.data[i].yValue);

      // `fill` can be batched, but `stroke` can't (it draws  extraneous lines even with `moveTo`).
      // https://html.spec.whatwg.org/multipage/scripting.html#dom-context-2d-arc
      if (!isFilled) {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.stroke();
      } else {
        context.moveTo(x, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      }
    }

    if (isFilled) {
      context.fill();
    }
  };
}

export default wrapWithAnimatedYDomain(PointLayer);
