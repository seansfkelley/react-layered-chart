import React from 'react';
import PureRender from 'pure-render-decorator';
import classnames from 'classnames';
import { decorator as PixelRatioContext } from './mixins/PixelRatioContext';

@PureRender
@PixelRatioContext
class Stack extends React.Component {
  static propTypes = {
    className: React.PropTypes.string,
    pixelRatio: React.PropTypes.number
  };

  render() {
    return (
      <div className={classnames('lc-stack', this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}

export default Stack;
