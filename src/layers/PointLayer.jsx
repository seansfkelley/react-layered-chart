import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AnimateProps from '../mixins/AnimateProps';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getBoundsForInstantaeousData } from '../util';
import propTypes from '../propTypes';

@PureRender
@CanvasRender
@AnimateProps
class PointLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.dataPoint).isRequired,
    xDomain: propTypes.range.isRequired,
    yDomain: propTypes.range.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string,
    radius: React.PropTypes.number
  };

  static defaultProps = {
    yScale: d3Scale.linear,
    color: 'rgba(0, 0, 0, 0.7)',
    radius: 3
  };

  animatedProps = {
    yDomain: 1000
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
    for (let i = firstIndex; i < lastIndex; ++i) {
      const x = xScale(this.props.data[i].timestamp);
      const y = height - yScale(this.props.data[i].value);

      context.moveTo(x, y);
      context.arc(x, y, this.props.radius, 0, Math.PI * 2);
    }

    context.fillStyle = this.props.color;
    context.fill();
  };
}

export default PointLayer;
