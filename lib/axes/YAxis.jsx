import React from 'react';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from '../layers/AutoresizingCanvasLayer';

const HORIZONTAL_PADDING = 6;
const TICK_LENGTH = 4;

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
    return <AutoresizingCanvasLayer
      className='y-axis'
      ref='canvasLayer'
      onSizeChange={this.canvasRender}
    />;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.resetTransform();
    context.clearRect(0, 0, width, height);
    context.translate(0.5, 0.5);

    const yScale = this.props.yScale()
      .domain([ this.props.yDomain.start, this.props.yDomain.end ])
      .rangeRound([ 0, height ]);

    const ticks = yScale.ticks(5);
    const format = yScale.tickFormat(5);

    context.beginPath();

    context.textAlign = 'end';
    context.textBaseline = 'middle';
    context.fillStyle = this.props.color;
    context.font = '12px sans-serif';
    context.strokeStyle = '#777';

    const maxTextWidth = Math.ceil(_.max(ticks.map(t => context.measureText(format(t)).width)));

    for (let i = 0; i < ticks.length; ++i) {
      const yOffset = height - yScale(ticks[i]);

      context.fillText(format(ticks[i]), maxTextWidth + HORIZONTAL_PADDING, yOffset);

      context.moveTo(maxTextWidth + HORIZONTAL_PADDING * 2, yOffset);
      context.lineTo(maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, yOffset)
      context.stroke();
    }

    context.moveTo(maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, 0);
    context.lineTo(maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, height)
    context.stroke();
  };
}

export default YAxis;
