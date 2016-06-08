import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';
import { Interval, Color } from '../interfaces';

export interface Props {
  xDomain: Interval;
  hover?: number;
  stroke?: Color;
}

@PureRender
@NonReactRender
@PixelRatioContext
export default class HoverLineLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    hover: React.PropTypes.number,
    xDomain: propTypes.interval.isRequired,
    stroke: React.PropTypes.string
  } as React.ValidationMap<Props>;

  static defaultProps = {
    stroke: 'rgba(0, 0, 0, 1)'
  } as any as Props;

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.nonReactRender}/>;
  }

  nonReactRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(
      this.refs['canvasLayer'] as AutoresizingCanvasLayer,
      this.context.pixelRatio
    );

    if (!_.isNumber(this.props.hover)) {
      return;
    }

    const xScale = d3Scale.scaleLinear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);
    const xPos = xScale(this.props.hover);

    context.beginPath();
    context.moveTo(xPos, 0);
    context.lineTo(xPos, height);

    if (this.props.stroke) {
      context.lineWidth = 1;
      context.strokeStyle = this.props.stroke;
      context.stroke();
    }
  };
}
