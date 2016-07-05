import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
import { getIndexBoundsForSpanData } from '../renderUtils';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import propTypes from '../propTypes';
import { Interval, Color, ScaleFunction, BucketDatum } from '../interfaces';

export interface Props {
  data: BucketDatum[];
  xDomain: Interval;
  yDomain: Interval;
  yScale?: ScaleFunction;
  color?: Color;
}

@PureRender
@NonReactRender
@PixelRatioContext
class BucketedLineLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.bucketDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    yDomain: propTypes.interval.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string
  } as React.ValidationMap<Props>;

  static defaultProps = {
    yScale: d3Scale.scaleLinear,
    color: '#444'
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
  const { firstIndex, lastIndex } = getIndexBoundsForSpanData(props.data, props.xDomain, 'minXValue', 'maxXValue');

  if (firstIndex === lastIndex) {
    return;
  }

  // Don't use rangeRound -- it causes flicker as you pan/zoom because it doesn't consistently round in one direction.
  const xScale = d3Scale.scaleLinear()
    .domain([ props.xDomain.min, props.xDomain.max ])
    .range([ 0, width ]);

  const yScale = props.yScale()
    .domain([ props.yDomain.min, props.yDomain.max ])
    .range([ 0, height ]);

  const computedValuesForVisibleData = props.data
  .slice(firstIndex, lastIndex)
  .map(datum => {
    // TODO: Why is this ceiling'd? There must have been a reason...
    // I think this was to avoid jitter, but if you zoom really slowly when the rects
    // are small you can still see them jitter in their width...
    const minX = Math.ceil(xScale(datum.minXValue));
    const maxX = Math.max(Math.floor(xScale(datum.maxXValue)), minX + 1);

    const minY = Math.floor(yScale(datum.minYValue));
    const maxY = Math.max(Math.floor(yScale(datum.maxYValue)), minY + 1);

    return {
      minX,
      maxX,
      minY,
      maxY,
      firstY: Math.floor(yScale(datum.firstYValue)),
      lastY: Math.floor(yScale(datum.lastYValue)),
      width: maxX - minX,
      height: maxY - minY
    };
  });

  // Bars
  context.beginPath();
  for (let i = 0; i < computedValuesForVisibleData.length; ++i) {
    const computedValues = computedValuesForVisibleData[i];
    if (computedValues.width !== 1 || computedValues.height !== 1) {
      context.rect(
        computedValues.minX,
        height - computedValues.maxY,
        computedValues.width,
        computedValues.height
      );
    }
  }
  context.fillStyle = props.color;
  context.fill();

  // Lines
  context.translate(0.5, -0.5);
  context.beginPath();
  const firstComputedValues = computedValuesForVisibleData[0];
  context.moveTo(firstComputedValues.maxX - 1, height - firstComputedValues.lastY);
  for (let i = 1; i < computedValuesForVisibleData.length; ++i) {
    const computedValues = computedValuesForVisibleData[i];
    context.lineTo(computedValues.minX, height - computedValues.firstY);
    context.moveTo(computedValues.maxX - 1, height - computedValues.lastY);
  }
  context.strokeStyle = props.color;
  context.stroke();
}

export default wrapWithAnimatedYDomain(BucketedLineLayer);
