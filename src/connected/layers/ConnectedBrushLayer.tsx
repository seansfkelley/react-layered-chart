import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Range, Color, BrushLayer as UnconnectedBrushLayer } from '../../core';
import { ChartState } from '../model/state';
import { selectSelection, selectXDomain } from '../model/selectors';

export interface OwnProps {
  stroke?: Color;
  fill?: Color;
}

export interface ConnectedProps {
  xDomain: Range;
  selection?: Range;
}

@PureRender
class ConnectedBrushLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <UnconnectedBrushLayer {...this.props}/>
    );
  }
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    xDomain: selectXDomain(state),
    selection: selectSelection(state)
  };
}

export default connect(mapStateToProps)(ConnectedBrushLayer) as React.ComponentClass<OwnProps>;
