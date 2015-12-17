import React from 'react';
import PureRender from 'pure-render-decorator';

@PureRender
class Stack extends React.Component {
  static propTypes = {}

  render() {
    return (
      <div className='stack'>
        {this.props.children}
      </div>
    );
  }
}

export default Stack;
