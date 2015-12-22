import React from 'react';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getVisibleIndexBounds } from '../util';

@PureRender
@CanvasRender
class BucketedLineLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      bounds: React.PropTypes.shape({
        startTime: React.PropTypes.number.isRequired,
        endTime: React.PropTypes.number.isRequired,
        minValue: React.PropTypes.number.isRequired,
        maxValue: React.PropTypes.number.isRequired
      }).isRequired,
      earliestPoint: React.PropTypes.shape({
        timestamp: React.PropTypes.number.isRequired,
        value: React.PropTypes.number.isRequired
      }).isRequired,
      latestPoint: React.PropTypes.shape({
        timestamp: React.PropTypes.number.isRequired,
        value: React.PropTypes.number.isRequired
      }).isRequired
    })).isRequired,
    xDomain: React.PropTypes.shape({
      start: React.PropTypes.number.isRequired,
      end: React.PropTypes.number.isRequired
    }).isRequired,
    yDomain: React.PropTypes.shape({
      start: React.PropTypes.number.isRequired,
      end: React.PropTypes.number.isRequired
    }).isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string
  };

  static defaultProps = {
    yScale: d3.scale.linear,
    color: 'rgba(0, 0, 0, 0.7)'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.resetTransform();
    context.clearRect(0, 0, width, height);
    context.translate(0.5, 0.5);

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    // const { firstIndex, lastIndex } = getVisibleIndexBounds(this.props.data, this.props.xDomain);
    // if (firstIndex === lastIndex) {
    //   return;
    // }

    const firstIndex = 0;
    const lastIndex = this.props.data.length - 1;

    const xScale = d3.scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .rangeRound([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.props.yDomain.start, this.props.yDomain.end ])
      .rangeRound([ height, 0 ]);

    const getComputedValuesForIndex = _.memoize(i => {
      const datum = this.props.data[i];
      return {
        bounds: {
          x1: xScale(datum.bounds.startTime),
          x2: xScale(datum.bounds.endTime),
          y1: yScale(datum.bounds.minValue),
          y2: yScale(datum.bounds.maxValue)
        },
        earliestPoint: {
          x: xScale(datum.earliestPoint.timestamp),
          y: yScale(datum.earliestPoint.value)
        },
        latestPoint: {
          x: xScale(datum.latestPoint.timestamp),
          y: yScale(datum.latestPoint.value)
        }
      };
    });

    context.beginPath();

    // Bars
    for (let i = firstIndex; i <= lastIndex; ++i) {
      const computedValues = getComputedValuesForIndex(i);
      context.rect(
        computedValues.earliestPoint.x,
        height - computedValues.bounds.y2,
        computedValues.latestPoint.x - computedValues.earliestPoint.x,
        computedValues.bounds.y2 - computedValues.bounds.y1
      );
    }

    // Lines
    const firstComputedValues = getComputedValuesForIndex(firstIndex);
    context.moveTo(firstComputedValues.latestPoint.x, height - firstComputedValues.latestPoint.y)
    for (let i = firstIndex + 1; i <= lastIndex; ++i) {
      const computedValues = getComputedValuesForIndex(i);
      // TODO: Skip any that have touching rectangles.
      context.lineTo(computedValues.earliestPoint.x, height - computedValues.earliestPoint.y);
      context.moveTo(computedValues.latestPoint.x, height - computedValues.latestPoint.y);
    }

    context.strokeStyle = this.props.color;
    context.stroke();
    context.fillStyle = this.props.color;
    context.fill();
  }
}

export default BucketedLineLayer;
