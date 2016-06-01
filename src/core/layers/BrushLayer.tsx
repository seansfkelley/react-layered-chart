import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';
import { Range, Color } from '../interfaces';

export interface Props {
  xDomain: Range;
  selection?: Range;
  stroke?: Color;
  fill?: Color;
}

@PureRender
@NonReactRender
@PixelRatioContext
export default class BrushLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    selection: propTypes.range,
    xDomain: propTypes.range.isRequired,
    stroke: React.PropTypes.string,
    fill: React.PropTypes.string
  };

  static defaultProps = {
    stroke: 'rgba(0, 0, 0, 0.7)',
    fill: 'rgba(0, 0, 0, 0.1)'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.nonReactRender}/>;
  }

  nonReactRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(
      this.refs['canvasLayer'] as AutoresizingCanvasLayer,
      this.context.pixelRatio
    );

    if (!this.props.selection) {
      return;
    }

    const xScale = d3Scale.scaleLinear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    const left = xScale(this.props.selection.min);
    const right = xScale(this.props.selection.max);
    context.beginPath();
    context.rect(left, -1, right - left, height + 2);

    if (this.props.stroke) {
      context.lineWidth = 1;
      context.strokeStyle = this.props.stroke;
      context.stroke();
    }

    if (this.props.fill) {
      context.fillStyle = this.props.fill;
      context.fill();
    }
  };
}
