import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import AnimateProps from '../decorators/AnimateProps';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getIndexBoundsForPointData } from '../renderUtils';
import propTypes from '../propTypes';
import { Range, PointDatum, ScaleFunction, Color } from '../interfaces';

export interface Props {
  data: PointDatum[];
  xDomain: Range;
  yDomain: Range;
  yScale?: ScaleFunction;
  color?: Color;
  radius?: number;
  innerRadius?: number;
}

export interface State {
  animated_yDomain: Range;
}

@PureRender
@NonReactRender
@AnimateProps
@PixelRatioContext
export default class PointLayer extends React.Component<Props, State> {
  context: Context;

  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.pointDatum).isRequired,
    xDomain: propTypes.range.isRequired,
    yDomain: propTypes.range.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string,
    radius: React.PropTypes.number,
    innerRadius: React.PropTypes.number
  } as React.ValidationMap<any>;

  static defaultProps = {
    yScale: d3Scale.scaleLinear,
    color: 'rgba(0, 0, 0, 0.7)',
    radius: 3,
    innerRadius: 0
  } as any;

  animatedProps = {
    yDomain: 1000
  };

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
      .domain([ this.state.animated_yDomain.min, this.state.animated_yDomain.max ])
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
