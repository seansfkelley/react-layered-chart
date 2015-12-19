import React from 'react';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';

@PureRender
@CanvasRender
class BrushLayer extends React.Component {
  static propTypes = {
    selection: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    }),
    xDomain: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    }).isRequired,
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
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!this.props.selection) {
      return;
    }

    const xScale = d3.scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .range([ 0, width ]);

    const left = xScale(this.props.selection.start);
    const right = xScale(this.props.selection.end);
    context.beginPath();
    context.rect(left, 1, right - left, height - 2);

    if (this.props.stroke) {
      context.lineWidth = 1;
      context.strokeStyle = this.props.stroke;
      context.stroke();
    }

    if (this.props.fill) {
      context.fillStyle = this.props.fill;
      context.fill();
    }
  }
}

export default BrushLayer;
