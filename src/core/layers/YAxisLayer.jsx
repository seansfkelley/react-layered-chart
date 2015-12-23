import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AnimateProps from '../mixins/AnimateProps';
import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';

const HORIZONTAL_PADDING = 6;
const TICK_LENGTH = 4;

@PureRender
@CanvasRender
@AnimateProps
class YAxis extends React.Component {
  static propTypes = {
    // This awkward index-matching is because animation only supports animating top-level keys and we don't
    // want to animate a bunch of extraneous metadata.
    yDomains: React.PropTypes.arrayOf(propTypes.range).isRequired,
    colors: React.PropTypes.arrayOf(React.PropTypes.string),
    defaultColor: React.PropTypes.string
  };

  static defaultProps = {
    colors: [],
    defaultColor: '#444'
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
    context.font = '12px sans-serif';

    let xOffset = 0;
    _.each(this.state['animated-yDomains'], (yDomain, i) => {
      const yScale = d3Scale.linear()
        .domain([ yDomain.min, yDomain.max ])
        .rangeRound([ 0, height ]);

      const ticks = yScale.ticks(5);
      const format = yScale.tickFormat(5);

      const maxTextWidth = Math.ceil(_.max(ticks.map(t => context.measureText(format(t)).width)));

      context.beginPath();
      context.fillStyle = context.strokeStyle = (this.props.colors[i] || this.props.defaultColor);
      for (let i = 0; i < ticks.length; ++i) {
        const yOffset = height - yScale(ticks[i]);

        context.fillText(format(ticks[i]), xOffset + maxTextWidth + HORIZONTAL_PADDING, yOffset);

        context.moveTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2, yOffset);
        context.lineTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, yOffset)
      }

      context.moveTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, 0);
      context.lineTo(xOffset + maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH, height)

      context.stroke();

      xOffset += maxTextWidth + HORIZONTAL_PADDING * 2 + TICK_LENGTH;
    });
  };
}

export default YAxis;
