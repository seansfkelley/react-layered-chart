import React from 'react';
import PureRender from 'pure-render-decorator';

import SelectFromStore from './SelectFromStore';
import Stack from './Stack';
import InteractionCaptureLayer from './InteractionCaptureLayer';

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
      <Stack store={this.props.store} seriesIds={this.state.seriesIds}>
        <InteractionCaptureLayer store={this.props.store}/>
      </Stack>
    );
  }
}

export default DefaultChart;
