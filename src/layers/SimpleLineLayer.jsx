import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import { decorator as CanvasRender } from '../mixins/CanvasRender';
import { decorator as AnimateProps } from '../mixins/AnimateProps';
import { decorator as PixelRatioContext } from '../mixins/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getBoundsForInstantaeousData } from '../util';
import propTypes from '../propTypes';

@PureRender
@CanvasRender
@AnimateProps
@PixelRatioContext
export default class SimpleLineLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.dataPoint).isRequired,
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

    const { firstIndex, lastIndex } = getBoundsForInstantaeousData(this.props.data, this.props.xDomain);
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3Scale.linear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.state['animated-yDomain'].min, this.state['animated-yDomain'].max ])
      .rangeRound([ 0, height ]);

    context.beginPath();

    context.moveTo(xScale(this.props.data[firstIndex].timestamp), height - yScale(this.props.data[firstIndex].value));
    for (let i = firstIndex + 1; i < lastIndex; ++i) {
      context.lineTo(xScale(this.props.data[i].timestamp), height - yScale(this.props.data[i].value));
    }

    context.strokeStyle = this.props.color;
    context.stroke();
  };
}
