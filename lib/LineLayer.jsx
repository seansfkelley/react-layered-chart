import React from 'react';
import PureRender from 'pure-render-decorator';
import CanvasRender from './CanvasRender';

function linearScale(value, domain, range) {
  const p = (value - domain.start) / (domain.end - domain.start);
  return p * (range.end - range.start) + range.start;
}

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
    yScale: React.PropTypes.func
  };

  state = {
    width: 0,
    height: 0
  };

  static defaultProps = {
    yScale: linearScale
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

    const xRange = { start: 0, end: canvas.width };
    const yRange = { start: 0, end: canvas.height };

    context.beginPath();
    context.moveTo(
      linearScale(this.props.data[0].timestamp, this.props.xDomain, xRange),
      this.props.yScale(this.props.data[0].value, this.props.yDomain, yRange)
    );

    for (let i = 1; i < this.props.data.length; ++i) {
      context.lineTo(
        linearScale(this.props.data[i].timestamp, this.props.xDomain, xRange),
        this.props.yScale(this.props.data[i].value, this.props.yDomain, yRange)
      );
    }

    context.stroke();
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
