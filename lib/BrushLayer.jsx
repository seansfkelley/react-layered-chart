import React from 'react';
import PureRender from 'pure-render-decorator';
import SelectFromStore from './SelectFromStore';
import CanvasRender from './CanvasRender';
import d3 from 'd3';

@PureRender
@SelectFromStore
@CanvasRender
class BrushLayer extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };

  static selectFromStore = {
    xAxis: 'xAxis',
    selection: 'selection'
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

    if (!this.state.selection) {
      return;
    }

    const xScale = d3.scale.linear()
      .domain([ this.state.xAxis.start, this.state.xAxis.end ])
      .range([ 0, this.state.width ]);

    const left = xScale(this.state.selection.start);
    const right = xScale(this.state.selection.end);
    context.beginPath();
    context.rect(left, 0, right - left, this.state.height);

    context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    context.stroke();

    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.fill();
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
