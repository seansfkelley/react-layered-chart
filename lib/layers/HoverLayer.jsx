import React from 'react';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';

@PureRender
@CanvasRender
class HoverLayer extends React.Component {
  static propTypes = {
    hover: React.PropTypes.number,
    xDomain: React.PropTypes.shape({
      start: React.PropTypes.number.isRequired,
      end: React.PropTypes.number.isRequired
    }).isRequired,
    stroke: React.PropTypes.string
  };

  static defaultProps = {
    stroke: 'rgba(0, 0, 0, 1)'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.resetTransform();
    context.clearRect(0, 0, width, height);
    context.translate(0.5, 0.5);

    if (!_.isNumber(this.props.hover)) {
      return;
    }

    const xScale = d3.scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
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

export default HoverLayer;
