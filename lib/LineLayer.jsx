import React from 'react';
import PureRender from 'pure-render-decorator';
import CanvasRender from './CanvasRender';
import d3 from 'd3';

@PureRender
@CanvasRender
class LineLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      timestamp: React.PropTypes.number,
      value: React.PropTypes.number
    })).isRequired,
    xDomain: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    }).isRequired,
    yDomain: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    }).isRequired,
    stroke: React.PropTypes.string,
    fill: React.PropTypes.string,
    yScale: React.PropTypes.func
  };

  static defaultProps = {
    yScale: d3.scale.linear,
    stroke: 'rgba(0, 0, 0, 0.7)',
    fill: null
  };

  state = {
    width: 0,
    height: 0
  };

  render() {
    return (
      <div className='layer resizing-wrapper' ref='wrapper'>
        <canvas className='canvas' ref='canvas' width={this.state.width} height={this.state.height}/>
      </div>
    );
  }

  canvasRender() {
    const canvas = this.refs.canvas;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    const xScale = d3.scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .range([ 0, this.state.width ]);

    const yScale = this.props.yScale()
      .domain([ this.props.yDomain.start, this.props.yDomain.end ])
      .range([ this.state.height, 0 ]);

    context.beginPath();

    context.moveTo(xScale(this.props.data[0].timestamp), yScale(this.props.data[0].value));
    for (let i = 1; i < this.props.data.length; ++i) {
      context.lineTo(xScale(this.props.data[i].timestamp), yScale(this.props.data[i].value));
    }

    if (this.props.stroke) {
      context.lineWidth = 1;
      context.strokeStyle = this.props.stroke;
      context.stroke();
    }

    if (this.props.fill) {
      context.lineTo(xScale(this.props.data[this.props.data.length - 1].timestamp), this.state.height);
      context.lineTo(xScale(this.props.data[0].timestamp), this.state.height);
      context.closePath();
      context.fillStyle = this.props.fill;
      context.fill();
    }
  }

  componentDidMount() {
    // This stuff should either be in a mixin or a component, but we need access to width and height to render the canvas correctly.
    this.setSizeFromWrapper();
    this.__setSizeInterval = setInterval(this.setSizeFromWrapper.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.__setSizeInterval);
  }

  setSizeFromWrapper() {
    this.setState({
      width: this.refs.wrapper.offsetWidth,
      height: this.refs.wrapper.offsetHeight
    });
  }
}

export default LineLayer;
