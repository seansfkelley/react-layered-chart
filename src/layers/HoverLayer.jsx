import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import { decorator as CanvasRender } from '../mixins/CanvasRender';
import { decorator as PixelRatioContext } from '../mixins/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';

@PureRender
@CanvasRender
@PixelRatioContext
export default class HoverLayer extends React.Component {
  static propTypes = {
    hover: React.PropTypes.number,
    xDomain: propTypes.range.isRequired,
    stroke: React.PropTypes.string
  };

  static defaultProps = {
    stroke: 'rgba(0, 0, 0, 1)'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(this.refs.canvasLayer, this.context.pixelRatio);

    if (!_.isNumber(this.props.hover)) {
      return;
    }

    const xScale = d3Scale.scaleLinear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);
    const xPos = xScale(this.props.hover);

    context.beginPath();
    context.moveTo(xPos, 0);
    context.lineTo(xPos, height);

    if (this.props.stroke) {
      context.lineWidth = 1;
      context.strokeStyle = this.props.stroke;
      context.stroke();
    }
  };
}
