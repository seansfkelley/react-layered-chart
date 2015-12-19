import React from 'react';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getVisibleIndexBounds } from '../util';

@PureRender
@CanvasRender
class LineLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      timestamp: React.PropTypes.number,
      value: React.PropTypes.number
    })).isRequired,
    xDomain: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    }).isRequired,
    yDomain: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    }).isRequired,
    yScale: React.PropTypes.func,
    stroke: React.PropTypes.string,
    fill: React.PropTypes.string
  };

  static defaultProps = {
    yScale: d3.scale.linear,
    stroke: 'rgba(0, 0, 0, 0.7)',
    fill: null
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    const { firstIndex, lastIndex } = getVisibleIndexBounds(this.props.data, this.props.xDomain);
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3.scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .range([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.props.yDomain.start, this.props.yDomain.end ])
      .range([ height, 0 ]);

    context.beginPath();

    context.moveTo(xScale(this.props.data[firstIndex].timestamp), yScale(this.props.data[firstIndex].value));
    for (let i = firstIndex; i <= lastIndex; ++i) {
      context.lineTo(xScale(this.props.data[i].timestamp), yScale(this.props.data[i].value));
    }

    if (this.props.stroke) {
      context.lineWidth = 1;
      context.strokeStyle = this.props.stroke;
      context.stroke();
    }

    if (this.props.fill) {
      context.lineTo(xScale(this.props.data[lastIndex].timestamp), height);
      context.lineTo(xScale(this.props.data[firstIndex].timestamp), height);
      context.closePath();
      context.fillStyle = this.props.fill;
      context.fill();
    }
  }
}

export default LineLayer;
