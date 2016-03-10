import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import { decorator as CanvasRender } from '../mixins/CanvasRender';
import { decorator as AnimateProps } from '../mixins/AnimateProps';
import { decorator as PixelRatioContext } from '../mixins/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getBoundsForTimeSpanData } from '../util';
import propTypes from '../propTypes';

@PureRender
@CanvasRender
@AnimateProps
@PixelRatioContext
export default class BucketedLineLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      startTime: React.PropTypes.number.isRequired,
      endTime: React.PropTypes.number.isRequired,
      minValue: React.PropTypes.number.isRequired,
      maxValue: React.PropTypes.number.isRequired,
      firstValue: React.PropTypes.number.isRequired,
      lastValue: React.PropTypes.number.isRequired
    })).isRequired,
    xDomain: propTypes.range.isRequired,
    yDomain: propTypes.range.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string
  };

  static defaultProps = {
    yScale: d3Scale.linear,
    color: 'rgba(0, 0, 0, 0.7)'
  };

  animatedProps = {
    yDomain: 1000
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(this.refs.canvasLayer, this.context.pixelRatio);

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    const { firstIndex, lastIndex } = getBoundsForTimeSpanData(this.props.data, this.props.xDomain, 'startTime', 'endTime');
    if (firstIndex === lastIndex) {
      return;
    }

    // Don't use rangeRound -- it causes flicker as you pan/zoom because it doesn't consistently round in one direction.
    const xScale = d3Scale.linear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .range([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.state['animated-yDomain'].min, this.state['animated-yDomain'].max ])
      .range([ 0, height ]);

    const getComputedValuesForIndex = _.memoize(i => {
      const datum = this.props.data[i];

      const earliestX = Math.ceil(xScale(datum.startTime));
      const latestX = Math.floor(xScale(datum.endTime));

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

      const preferredY1 = Math.floor(yScale(datum.minValue));
      const preferredY2 = Math.floor(yScale(datum.maxValue));

      return {
        minX: preferredX1,
        maxX: preferredX2,
        minY: preferredY1,
        maxY: preferredY2,
        firstY: Math.floor(yScale(datum.firstValue)),
        lastY: Math.floor(yScale(datum.lastValue)),
        width: preferredX2 - preferredX1,
        height: preferredY2 - preferredY1
      };
    });

    // Bars
    context.beginPath();
    for (let i = firstIndex; i < lastIndex; ++i) {
      const computedValues = getComputedValuesForIndex(i);
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
    const firstComputedValues = getComputedValuesForIndex(firstIndex);
    context.moveTo(firstComputedValues.maxX, height - firstComputedValues.lastY)
    for (let i = firstIndex + 1; i < lastIndex; ++i) {
      const computedValues = getComputedValuesForIndex(i);
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
