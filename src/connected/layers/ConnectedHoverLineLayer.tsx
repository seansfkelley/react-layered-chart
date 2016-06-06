import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Interval, HoverLineLayer as UnconnectedHoverLineLayer } from '../../core';
import { ChartState } from '../model/state';
import { selectHover, selectXDomain } from '../model/selectors';

export interface OwnProps {
  color?: string;
}

export interface ConnectedProps {
  hover?: number;
  xDomain: Interval;
}

@PureRender
class ConnectedHoverLineLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <UnconnectedHoverLineLayer
        hover={this.props.hover}
        xDomain={this.props.xDomain}
        stroke={this.props.color}
      />
    );
  }
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    hover: selectHover(state),
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(ConnectedHoverLineLayer) as React.ComponentClass<OwnProps>;
