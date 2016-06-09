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
    color: 'rgba(0, 0, 0, 0.7)'
  } as any as Props;

  animatedProps = {
    yDomain: 1000
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

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    const { firstIndex, lastIndex } = getIndexBoundsForSpanData(this.props.data, this.props.xDomain, 'minXValue', 'maxXValue');
    if (firstIndex === lastIndex) {
      return;
    }

    // Don't use rangeRound -- it causes flicker as you pan/zoom because it doesn't consistently round in one direction.
    const xScale = d3Scale.scaleLinear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .range([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .range([ 0, height ]);

    const computedValuesForVisibleData = this.props.data
    .slice(firstIndex, lastIndex)
    .map(datum => {
      const earliestX = Math.ceil(xScale(datum.minXValue));
      const latestX = Math.floor(xScale(datum.maxXValue));

      let preferredX1;
      let preferredX2;
      if (latestX - earliestX < 1) {
        // Enforce that we have at least a pixel's width: this way, if the bounds span more than one value,
        // we are sure to render a 1px wide rectangle that covers it.
        preferredX1 = earliestX;
        preferredX2 = earliestX + 1;
      } else {
        preferredX1 = earliestX;
        preferredX2 = latestX;
      }

      const preferredY1 = Math.floor(yScale(datum.minYValue));
      const preferredY2 = Math.floor(yScale(datum.maxYValue));

      return {
        minX: preferredX1,
        maxX: preferredX2,
        minY: preferredY1,
        maxY: preferredY2,
        firstY: Math.floor(yScale(datum.firstYValue)),
        lastY: Math.floor(yScale(datum.lastYValue)),
        width: preferredX2 - preferredX1,
        height: preferredY2 - preferredY1
      };
    });

    // Bars
    context.beginPath();
    for (let i = 0; i < computedValuesForVisibleData.length; ++i) {
      const computedValues = computedValuesForVisibleData[i];
      if (computedValues.width >= 1 && computedValues.height >= 1) {
        context.rect(
          computedValues.minX,
          height - computedValues.maxY,
          computedValues.width,
          computedValues.height
        );
      }
    }
    context.fillStyle = this.props.color;
    context.fill();

    // Lines
    context.beginPath();
    const firstComputedValues = computedValuesForVisibleData[0];
    context.moveTo(firstComputedValues.maxX, height - firstComputedValues.lastY)
    for (let i = 1; i < computedValuesForVisibleData.length; ++i) {
      const computedValues = computedValuesForVisibleData[i];
      // TODO: Skip any that have touching rectangles?
      context.lineTo(computedValues.minX, height - computedValues.firstY);
      if (computedValues.width >= 1 && computedValues.height >= 1) {
        context.moveTo(computedValues.maxX, height - computedValues.lastY);
      }
    }
    context.strokeStyle = this.props.color;
    context.stroke();
  };
}

export default wrapWithAnimatedYDomain(BucketedLineLayer);
