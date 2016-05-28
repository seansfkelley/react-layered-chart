import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';
import { layers, Range } from 'react-layered-chart';
const { HoverLayer: LayeredChartHoverLayer } = layers;

import { ChartState } from '../model/state';
import { selectHover, selectXDomain } from '../model/selectors';

export interface OwnProps {
  color?: string;
}

export interface ConnectedProps {
  hover?: number;
  xDomain: Range;
}

@PureRender
class HoverLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <LayeredChartHoverLayer
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

export default connect(mapStateToProps)(HoverLayer) as React.ComponentClass<OwnProps>;
