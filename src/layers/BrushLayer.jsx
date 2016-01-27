import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';

import { decorator as CanvasRender } from '../mixins/CanvasRender';
import { decorator as PixelRatioContext } from '../mixins/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';

@PureRender
@CanvasRender
@PixelRatioContext
class BrushLayer extends React.Component {
  static propTypes = {
    selection: propTypes.range,
    xDomain: propTypes.range.isRequired,
    stroke: React.PropTypes.string,
    fill: React.PropTypes.string
  };

  static defaultProps = {
    stroke: 'rgba(0, 0, 0, 0.7)',
    fill: 'rgba(0, 0, 0, 0.1)'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.resetTransform();
    context.scale(this.context.pixelRatio, this.context.pixelRatio);
    context.clearRect(0, 0, width, height);
    context.translate(0.5, 0.5);

    if (!this.props.selection) {
      return;
    }

    const xScale = d3Scale.linear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    const left = xScale(this.props.selection.min);
    const right = xScale(this.props.selection.max);
    context.beginPath();
    context.rect(left, -1, right - left, height + 2);

    if (this.props.stroke) {
      context.lineWidth = 1;
      context.strokeStyle = this.props.stroke;
      context.stroke();
    }

    if (this.props.fill) {
      context.fillStyle = this.props.fill;
      context.fill();
    }
  };
}

export default BrushLayer;
