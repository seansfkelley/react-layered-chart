import React from 'react';
import PureRender from 'pure-render-decorator';

@PureRender
class AutoresizingCanvasLayer extends React.Component {
  static propTypes = {
    onSizeChange: React.PropTypes.func.isRequired
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

  getCanvasElement() {
    return this.refs.canvas;
  }

  getDimensions() {
    return {
      width: this.state.width,
      height: this.state.height
    };
  }

  componentDidUpdate() {
    this.props.onSizeChange();
  }

  componentDidMount() {
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

export default AutoresizingCanvasLayer;
