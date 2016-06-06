import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getIndexBoundsForSpanData } from '../renderUtils';
import propTypes from '../propTypes';
import { Interval, Color } from '../interfaces';

export interface Props {
  data: {
    minXValue: number;
    maxXValue: number;
    color?: Color;
  }[];
  xDomain: Interval;
  color?: Color;
}

@PureRender
@NonReactRender
@PixelRatioContext
export default class SpanLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      minXValue: React.PropTypes.number.isRequired,
      maxXValue: React.PropTypes.number.isRequired,
      color: React.PropTypes.string
    })).isRequired,
    xDomain: propTypes.interval.isRequired,
    color: React.PropTypes.string
  };

  static defaultProps = {
    color: 'rgba(0, 0, 0, 0.1)'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.nonReactRender}/>;
  }

  nonReactRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(
      this.refs['canvasLayer'] as AutoresizingCanvasLayer,
      this.context.pixelRatio
    );

    const { firstIndex, lastIndex } = getIndexBoundsForSpanData(this.props.data, this.props.xDomain, 'minXValue', 'maxXValue');
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3Scale.scaleLinear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    for (let i = firstIndex; i < lastIndex; ++i) {
      const left = xScale(this.props.data[i].minXValue);
      const right = xScale(this.props.data[i].maxXValue);
      context.beginPath();
      context.rect(left, 0, right - left, height);
      context.fillStyle = this.props.data[i].color || this.props.color;
      context.fill();
    }
  };
}
