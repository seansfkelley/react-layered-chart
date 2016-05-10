import _ from 'lodash';
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
      <div className={classnames('lc-stack', this.props.className)} ref='element'>
        {React.Children.map(this.props.children, (child, i) =>
          React.cloneElement(child, { className: classnames('lc-layer', child.props.className) }))}
      </div>
    );
  }
}

export default Stack;
