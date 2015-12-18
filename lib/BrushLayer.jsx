import React from 'react';
import PureRender from 'pure-render-decorator';
import CanvasRender from './CanvasRender';
import d3 from 'd3';

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

    if (!this.props.selection) {
      return;
    }

    const xScale = d3.scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .range([ 0, this.state.width ]);

    const left = xScale(this.props.selection.start);
    const right = xScale(this.props.selection.end);
    context.beginPath();
    context.rect(left, 1, right - left, this.state.height - 2);

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

export default BrushLayer;
