import React from 'react';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from '../layers/AutoresizingCanvasLayer';

const VERTICAL_PADDING = 4;
const HORIZONTAL_PADDING = 6;

@PureRender
@CanvasRender
class XAxis extends React.Component {
  static propTypes = {
    xDomain: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    }).isRequired,
    color: React.PropTypes.string
  };

  static defaultProps = {
    color: '#444'
  };

  render() {
    return <AutoresizingCanvasLayer
      className='x-axis'
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

    const xScale = d3.time.scale()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .rangeRound([ 0, width ]);

    const ticks = xScale.ticks(5);
    const format = xScale.tickFormat(5);

    context.beginPath();

    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillStyle = this.props.color;
    context.font = '12px sans-serif';
    context.strokeStyle = this.props.color;

    for (let i = 0; i < ticks.length; ++i) {
      const xOffset = xScale(ticks[i]);

      context.fillText(format(ticks[i]).toUpperCase(),  xOffset + HORIZONTAL_PADDING, VERTICAL_PADDING);

      context.moveTo(xOffset, 0);
      context.lineTo(xOffset, height)
      context.stroke();
    }
  };
}

export default XAxis;
