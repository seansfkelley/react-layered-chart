import * as React from 'react';
import * as d3Scale from 'd3-scale';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
import { getIndexBoundsForSpanData } from '../renderUtils';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import propTypes from '../propTypes';
import { Color, Interval, BarDatum } from '../interfaces';

export interface Props {
  data: BarDatum[];
  xDomain: Interval;
  yDomain: Interval;
  color?: Color;
}

@NonReactRender
@PixelRatioContext
class BarLayer extends React.PureComponent<Props, void> {
  context: Context;

  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.barDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    yDomain: propTypes.interval.isRequired,
    color: React.PropTypes.string
  } as React.ValidationMap<Props>;

  static defaultProps: Partial<Props> = {
    color: 'rgba(0, 0, 0, 0.7)'
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
    _renderCanvas(this.props, width, height, context);
  };
}

// Export for testing.
export function _renderCanvas(props: Props, width: number, height: number, context: CanvasRenderingContext2D) {
  const { firstIndex, lastIndex } = getIndexBoundsForSpanData(props.data, props.xDomain, 'minXValue', 'maxXValue');
  if (firstIndex === lastIndex) {
    return;
  }

  const xScale = d3Scale.scaleLinear()
    .domain([ props.xDomain.min, props.xDomain.max ])
    .rangeRound([ 0, width ]);

  const yScale = d3Scale.scaleLinear()
    .domain([ props.yDomain.min, props.yDomain.max ])
    .rangeRound([ 0, height ]);

  context.beginPath();

  for (let i = firstIndex; i < lastIndex; ++i) {
    const left = xScale(props.data[i].minXValue);
    const right = xScale(props.data[i].maxXValue);
    const top = height - yScale(props.data[i].yValue);
    const bottom = height - yScale(0);

    context.rect(left, bottom, right - left, top - bottom);
  }

  context.fillStyle = props.color!;
  context.fill();
}

export default wrapWithAnimatedYDomain(BarLayer);
