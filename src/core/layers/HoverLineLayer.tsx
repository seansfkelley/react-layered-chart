import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import CanvasRender from '../decorators/CanvasRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';
import { Range, Color } from '../interfaces';

export interface Props {
  xDomain: Range;
  hover?: number;
  stroke?: Color;
}

@PureRender
@CanvasRender
@PixelRatioContext
export default class HoverLineLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    hover: React.PropTypes.number,
    xDomain: propTypes.range.isRequired,
    stroke: React.PropTypes.string
  } as React.ValidationMap<any>;

  static defaultProps = {
    stroke: 'rgba(0, 0, 0, 1)'
  } as any;

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
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
