import React from 'react';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from '../layers/AutoresizingCanvasLayer';

@PureRender
@CanvasRender
class YAxis extends React.Component {
  static propTypes = {
    yDomain: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    }).isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string
  };

  static defaultProps = {
    yScale: d3.scale.linear,
    color: '#444'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const yScale = this.props.yScale()
      .domain([ this.props.yDomain.start, this.props.yDomain.end ])
      .range([ 0, height ]);

    const ticks = yScale.ticks(5);
    const format = yScale.tickFormat(5);

    context.beginPath();

    context.textAlign = 'end';
    context.textBaseline = 'middle';
    context.fillStyle = this.props.color;
    context.font = '12px sans-serif';

    const maxTextWidth = _.max(ticks.map(t => context.measureText(format(t)).width));

    for (let i = 0; i < ticks.length; ++i) {
      const yHeight = height - yScale(ticks[i]);

      context.fillText(format(ticks[i]), maxTextWidth + 6, yHeight);

      context.moveTo(maxTextWidth + 18, yHeight);
      context.lineTo(maxTextWidth + 12, yHeight)
      context.strokeStyle = '#777';
      context.stroke();
    }

    context.moveTo(maxTextWidth + 18, 0);
    context.lineTo(maxTextWidth + 18, height)
    context.strokeStyle = '#777';
    context.stroke();
  };
}

export default YAxis;
