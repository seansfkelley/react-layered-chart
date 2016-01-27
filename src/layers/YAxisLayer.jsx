import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import { decorator as CanvasRender } from '../mixins/CanvasRender';
import { decorator as AnimateProps } from '../mixins/AnimateProps';
import { decorator as PixelRatioContext } from '../mixins/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';

const HORIZONTAL_PADDING = 6;
const TICK_LENGTH = 4;

@PureRender
@CanvasRender
@AnimateProps
@PixelRatioContext
class YAxisLayer extends React.Component {
  static propTypes = {
    // This awkward index-matching is because animation only supports animating top-level keys and we don't
    // want to animate a bunch of extraneous metadata.
    yDomains: React.PropTypes.arrayOf(propTypes.range).isRequired,
    scales: React.PropTypes.arrayOf(React.PropTypes.func),
    ticks: React.PropTypes.arrayOf(React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.arrayOf(React.PropTypes.number)
    ])),
    colors: React.PropTypes.arrayOf(React.PropTypes.string),
    defaultColor: React.PropTypes.string,
    font: React.PropTypes.string
  };

  static defaultProps = {
    colors: [],
    defaultColor: '#444',
    font: '12px sans-serif'
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
    context.scale(this.context.pixelRatio, this.context.pixelRatio);
    context.clearRect(0, 0, width, height);
    context.translate(0.5, 0.5);

    context.textAlign = 'end';
    context.textBaseline = 'middle';
    context.font = this.props.font;

    let xOffset = 0;
    _.each(this.state['animated-yDomains'], (yDomain, i) => {
      const scaleFn = (this.props.scales || [])[i] || d3Scale.linear;
      const yScale = scaleFn()
        .domain([ yDomain.min, yDomain.max ])
        .rangeRound([ 0, height ]);

      let ticks;
      let computeTicks = _.get(this, [ 'props', 'ticks', i ]);
      if (computeTicks) {
        if (_.isFunction(computeTicks)) {
          ticks = computeTicks(yDomain);
        } else if (_.isArray(computeTicks)) {
          ticks = computeTicks;
        } else {
          throw new Error('ticks must be a function or array');
        }
      } else {
        ticks = yScale.ticks(5);
      }
      // TODO: Does this also need to be configurable?
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

export default YAxisLayer;
