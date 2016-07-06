import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
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
    return <PollingResizingCanvasLayer
      ref='canvasLayer'
      onSizeChange={this.nonReactRender}
      pixelRatio={this.context.pixelRatio}
    />;
  }

  nonReactRender = () => {
    const { width, height, context } = (this.refs['canvasLayer'] as PollingResizingCanvasLayer).resetCanvas();
    _renderCanvas(this.props, width, height, context);
  };
}

// Export for testing.
export function _renderCanvas(props: Props, width: number, height: number, context: CanvasRenderingContext2D) {
  // Should we draw something if there is one data point?
  if (props.data.length < 2) {
    return;
  }

  const { firstIndex, lastIndex } = getIndexBoundsForPointData(props.data, props.xDomain, 'xValue');
  if (firstIndex === lastIndex) {
    return;
  }

  const xScale = d3Scale.scaleLinear()
    .domain([ props.xDomain.min, props.xDomain.max ])
    .rangeRound([ 0, width ]);

  const yScale = props.yScale()
    .domain([ props.yDomain.min, props.yDomain.max ])
    .rangeRound([ 0, height ]);

  context.translate(0.5, -0.5);
  context.beginPath();

  context.moveTo(xScale(props.data[firstIndex].xValue), height - yScale(props.data[firstIndex].yValue));
  for (let i = firstIndex + 1; i < lastIndex; ++i) {
    context.lineTo(xScale(props.data[i].xValue), height - yScale(props.data[i].yValue));
  }

  context.strokeStyle = props.color;
  context.stroke();
}

export default wrapWithAnimatedYDomain(SimpleLineLayer);
