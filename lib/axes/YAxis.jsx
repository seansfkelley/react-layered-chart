import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AnimateProps from '../mixins/AnimateProps';
import AutoresizingCanvasLayer from '../layers/AutoresizingCanvasLayer';

const HORIZONTAL_PADDING = 6;
const TICK_LENGTH = 4;

@PureRender
@CanvasRender
@AnimateProps
class YAxis extends React.Component {
  static propTypes = {
    yDomains: React.PropTypes.arrayOf(React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    })).isRequired,
    color: React.PropTypes.string
  };

  static defaultProps = {
    color: '#444'
  };

  animatedProps = {
    yDomains: 1000
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

    context.textAlign = 'end';
    context.textBaseline = 'middle';
    context.fillStyle = this.props.color;
    context.font = '12px sans-serif';
    context.strokeStyle = '#777';

    context.beginPath();
    let xOffset = 0;
    _.each(this.state['animated-yDomains'], yDomain => {
      const yScale = d3Scale.linear()
        .domain([ yDomain.start, yDomain.end ])
        .rangeRound([ 0, height ]);

      const ticks = yScale.ticks(5);
      const format = yScale.tickFormat(5);

      const maxTextWidth = Math.ceil(_.max(ticks.map(t => context.measureText(format(t)).width)));

      for (let i = 0; i < ticks.length; ++i) {
        const yOffset = height - yScale(ticks[i]);

        context.fillText(format(ticks[i]), xOffset + maxTextWidth + HORIZONTAL_PADDING, yOffset);

        context.moveTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2, yOffset);
        context.lineTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, yOffset)
      }

      context.moveTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, 0);
      context.lineTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, height)

      xOffset += maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH;
    });

    context.stroke();
  };
}

export default YAxis;
