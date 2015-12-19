import React from 'react';
import PureRender from 'pure-render-decorator';
import classnames from 'classnames';

@PureRender
class Stack extends React.Component {
  static propTypes = {
    className: React.PropTypes.string
  };

  render() {
    return (
      <div className={classnames('stack', this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}

export default Stack;
