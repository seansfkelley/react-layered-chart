import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AnimateProps from '../mixins/AnimateProps';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getVisibleIndexBounds } from '../util';

@PureRender
@CanvasRender
@AnimateProps
class PointLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      timestamp: React.PropTypes.number.isRequired,
      value: React.PropTypes.number.isRequired
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
    stroke: React.PropTypes.string,
    fill: React.PropTypes.string,
    radius: React.PropTypes.number
  };

  static defaultProps = {
    yScale: d3Scale.linear,
    stroke: null,
    fill: 'rgba(0, 0, 0, 0.7)',
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

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    const { firstIndex, lastIndex } = getVisibleIndexBounds(this.props.data, this.props.xDomain);
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3Scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .rangeRound([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.state['animated-yDomain'].start, this.state['animated-yDomain'].end ])
      .rangeRound([ height, 0 ]);

    context.strokeStyle = this.props.stroke;
    context.fillStyle = this.props.fill;

    context.beginPath();
    for (let i = firstIndex; i <= lastIndex; ++i) {
      const x = xScale(this.props.data[i].timestamp);
      const y = yScale(this.props.data[i].value);

      context.moveTo(x, y);
      context.arc(x, y, this.props.radius, 0, Math.PI * 2);
    }

    if (this.props.stroke) {
      context.stroke();
    }

    if (this.props.fill) {
      context.fill();
    }
  }
}

export default PointLayer;
