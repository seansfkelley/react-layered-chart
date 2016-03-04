import _ from 'lodash';
import React from 'react';
import PureRender from 'pure-render-decorator';
import classnames from 'classnames';
import { decorator as PixelRatioContext } from './mixins/PixelRatioContext';

@PureRender
@PixelRatioContext
class Stack extends React.Component {
  static propTypes = {
    onSizeChange: React.PropTypes.func,
    className: React.PropTypes.string,
    pixelRatio: React.PropTypes.number
  };

  __lastSize = null;

  render() {
    return (
      <div className={classnames('lc-stack', this.props.className)} ref='element'>
        {this.props.children}
      </div>
    );
  }

  componentDidMount() {
    this.maybeCallOnSizeChange();
    this.__setSizeInterval = setInterval(this.maybeCallOnSizeChange.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.__setSizeInterval);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.onSizeChange && this.props.onSizeChange !== nextProps.onSizeChange && this.__lastSize) {
      nextProps.onSizeChange(this.__lastSize);
    }
  }

  maybeCallOnSizeChange() {
    const dimensions = {
      width: this.refs.element.offsetWidth,
      height: this.refs.element.offsetHeight
    };
    if (!_.isEqual(this.__lastSize, dimensions)) {
      this.__lastSize = dimensions;
      if (this.props.onSizeChange) {
        this.props.onSizeChange(dimensions);
      }
    }
  }
}

export default Stack;
