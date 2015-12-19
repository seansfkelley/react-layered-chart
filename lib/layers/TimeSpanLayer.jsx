import React from 'react';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';

@PureRender
@CanvasRender
class TimeSpanLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      timeSpan: React.PropTypes.shape({
        start: React.PropTypes.number.isRequired,
        end: React.PropTypes.number.isRequired
      }).isRequired,
      color: React.PropTypes.string
    })).isRequired,
    xDomain: React.PropTypes.shape({
      start: React.PropTypes.number.isRequired,
      end: React.PropTypes.number.isRequired
    }).isRequired,
    fill: React.PropTypes.string
  };

  static defaultProps = {
    fill: 'rgba(0, 0, 0, 0.2)'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    const [ firstIndex, lastIndex ] = [ 0, this.props.data.length - 1 ];

    const xScale = d3.scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .range([ 0, width ]);


    for (let i = firstIndex; i <= lastIndex; ++i) {
      const left = xScale(this.props.data[i].timeSpan.start);
      const right = xScale(this.props.data[i].timeSpan.end);
      context.beginPath();
      context.rect(left, 0, right - left, height);
      context.fillStyle = this.props.data[i].color || this.props.fill;
      context.fill();
    }
  }
}

export default TimeSpanLayer;
