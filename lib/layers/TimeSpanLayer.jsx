import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';

import propTypes from '../propTypes';

@PureRender
@CanvasRender
class TimeSpanLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      timeSpan: propTypes.timeSpan.isRequired,
      color: React.PropTypes.string
    })).isRequired,
    xDomain: propTypes.domain.isRequired,
    color: React.PropTypes.string
  };

  static defaultProps = {
    color: 'rgba(0, 0, 0, 0.1)'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);

    const [ firstIndex, lastIndex ] = [ 0, this.props.data.length - 1 ];

    const xScale = d3Scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .rangeRound([ 0, width ]);

    for (let i = firstIndex; i <= lastIndex; ++i) {
      const left = xScale(this.props.data[i].timeSpan.start);
      const right = xScale(this.props.data[i].timeSpan.end);
      context.beginPath();
      context.rect(left, 0, right - left, height);
      context.fillStyle = this.props.data[i].color || this.props.color;
      context.fill();
    }
  }
}

export default TimeSpanLayer;
