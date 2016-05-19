import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import { decorator as CanvasRender } from '../mixins/CanvasRender';
import { decorator as AnimateProps } from '../mixins/AnimateProps';
import { decorator as PixelRatioContext } from '../mixins/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getBoundsForInstantaeousData } from '../util';
import propTypes from '../propTypes';

@PureRender
@CanvasRender
@AnimateProps
@PixelRatioContext
export default class PointLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.dataPoint).isRequired,
    xDomain: propTypes.range.isRequired,
    yDomain: propTypes.range.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string,
    radius: React.PropTypes.number,
    innerRadius: React.PropTypes.number
  };

  static defaultProps = {
    yScale: d3Scale.scaleLinear,
    color: 'rgba(0, 0, 0, 0.7)',
    radius: 3,
    innerRadius: 0
  };

  animatedProps = {
    yDomain: 1000
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(this.refs.canvasLayer, this.context.pixelRatio);

    const { firstIndex, lastIndex } = getBoundsForInstantaeousData(this.props.data, this.props.xDomain);
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3Scale.scaleLinear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.state['animated-yDomain'].min, this.state['animated-yDomain'].max ])
      .rangeRound([ 0, height ]);

    const isFilled = this.props.innerRadius === 0;

    const radius = isFilled ? this.props.radius : (this.props.radius - this.props.innerRadius) / 2 + this.props.innerRadius;

    context.lineWidth = this.props.radius - this.props.innerRadius;
    context.strokeStyle = this.props.color;
    context.fillStyle = this.props.color;
    context.beginPath();
    for (let i = firstIndex; i < lastIndex; ++i) {
      const x = xScale(this.props.data[i].timestamp);
      const y = height - yScale(this.props.data[i].value);

      // `fill` can be batched, but `stroke` can't (it draws  extraneous lines even with `moveTo`).
      // https://html.spec.whatwg.org/multipage/scripting.html#dom-context-2d-arc
      if (!isFilled) {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.stroke();
      } else {
        context.moveTo(x, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      }
    }

    if (isFilled) {
      context.fill();
    }
  };
}
