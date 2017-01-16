import * as React from 'react';
import { scaleLinear } from 'd3-scale';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
import { getIndexBoundsForPointData } from '../renderUtils';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import propTypes from '../propTypes';
import { Interval, PointDatum, ScaleFunction, Color, JoinType } from '../interfaces';

export interface Props {
  data: PointDatum[];
  xDomain: Interval;
  yDomain: Interval;
  yScale?: ScaleFunction;
  color?: Color;
  joinType?: JoinType;
}

@NonReactRender
@PixelRatioContext
class LineLayer extends React.PureComponent<Props, void> {
  context: Context;

  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.pointDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    yDomain: propTypes.interval.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string
  } as React.ValidationMap<Props>;

  static defaultProps = {
    yScale: scaleLinear,
    color: 'rgba(0, 0, 0, 0.7)',
    joinType: JoinType.DIRECT
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

  const xScale = scaleLinear()
    .domain([ props.xDomain.min, props.xDomain.max ])
    .rangeRound([ 0, width ]);

  const yScale = props.yScale!()
    .domain([ props.yDomain.min, props.yDomain.max ])
    .rangeRound([ 0, height ]);

  context.translate(0.5, -0.5);
  context.beginPath();

  context.moveTo(xScale(props.data[firstIndex].xValue), height - yScale(props.data[firstIndex].yValue));
  for (let i = firstIndex + 1; i < lastIndex; ++i) {
    const xValue = xScale(props.data[i].xValue);
    const yValue = height - yScale(props.data[i].yValue);

    if (props.joinType === JoinType.LEADING) {
      context.lineTo(xScale(props.data[i - 1].xValue), yValue);
    } else if (props.joinType === JoinType.TRAILING) {
      context.lineTo(xValue, height - yScale(props.data[i - 1].yValue));
    }

    context.lineTo(xValue, yValue);
  }

  context.strokeStyle = props.color!;
  context.stroke();
}

export default wrapWithAnimatedYDomain(LineLayer);
