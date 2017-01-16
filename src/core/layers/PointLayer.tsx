import * as React from 'react';
import { scaleLinear } from 'd3-scale';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
import { getIndexBoundsForPointData } from '../renderUtils';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import propTypes from '../propTypes';
import { Interval, PointDatum, ScaleFunction, Color } from '../interfaces';

const TWO_PI = Math.PI * 2;

export interface Props {
  data: PointDatum[];
  xDomain: Interval;
  yDomain: Interval;
  yScale?: ScaleFunction;
  color?: Color;
  radius?: number;
  innerRadius?: number;
}

@NonReactRender
@PixelRatioContext
class PointLayer extends React.PureComponent<Props, void> {
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
    yScale: scaleLinear,
    color: 'rgba(0, 0, 0, 0.7)',
    radius: 3,
    innerRadius: 0
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

  const isFilled = props.innerRadius === 0;

  const radius = isFilled ? props.radius! : (props.radius - props.innerRadius) / 2 + props.innerRadius;

  context.lineWidth = props.radius - props.innerRadius;
  context.strokeStyle = props.color!;
  context.fillStyle = props.color!;

  if (isFilled) {
    context.beginPath();
  }

  for (let i = firstIndex; i < lastIndex; ++i) {
    const x = xScale(props.data[i].xValue);
    const y = height - yScale(props.data[i].yValue);

    // `fill` can be batched, but `stroke` can't (it draws  extraneous lines even with `moveTo`).
    // https://html.spec.whatwg.org/multipage/scripting.html#dom-context-2d-arc
    if (!isFilled) {
      context.beginPath();
      context.arc(x, y, radius, 0, TWO_PI);
      context.stroke();
    } else {
      context.moveTo(x, y);
      context.arc(x, y, radius, 0, TWO_PI);
    }
  }

  if (isFilled) {
    context.fill();
  }
}

export default wrapWithAnimatedYDomain(PointLayer);
