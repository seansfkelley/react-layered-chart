import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Range, Color, XAxisLayer as UnconnectedXAxisLayer} from '../../core';
import { ChartState } from '../model/state';
import { selectXDomain } from '../model/selectors';

export interface OwnProps {
  font?: string;
  color?: Color;
}

export interface ConnectedProps {
  xDomain: Range;
}

@PureRender
export class ConnectedXAxisLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <UnconnectedXAxisLayer
        xDomain={this.props.xDomain}
        font={this.props.font}
        color={this.props.color}
      />
    );
  }
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(ConnectedXAxisLayer) as React.ComponentClass<OwnProps>;
