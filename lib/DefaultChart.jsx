import React from 'react';
import ReactDOM from 'react-dom';
import PureRender from 'pure-render-decorator';

import SelectFromStore from './SelectFromStore';
import Stack from './Stack';
import ActionType from './ActionType';

@PureRender
@SelectFromStore
class DefaultChart extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };

  static selectFromStore = {
    seriesIds: 'seriesIds'
  };

  render() {
    return (
      <Stack store={this.props.store} seriesIds={this.state.seriesIds} ref='stack'>
        <div
          className='layer interaction-capture'
          onMouseMove={this._onMouseMove}
          onMouseLeave={this._onMouseLeave}
        />
      </Stack>
    );
  }

  _onMouseMove = (event) => {
    const boundingClientRect = ReactDOM.findDOMNode(this.refs.stack).getBoundingClientRect();
    this.props.store.dispatch({
      type: ActionType.SET_CURSOR,
      payload: {
        x: event.clientX - boundingClientRect.left,
        y: event.clientY - boundingClientRect.top
      }
    });
  };

  _onMouseLeave = (event) => {
    this.props.store.dispatch({
      type: ActionType.SET_CURSOR,
      payload: null
    });
  };
}

export default DefaultChart;
