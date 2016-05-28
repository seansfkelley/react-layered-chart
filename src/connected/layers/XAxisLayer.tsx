import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { default as UnconnectedXAxisLayer } from '../../layers/XAxisLayer';
import { Range, Color } from '../../interfaces';
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
export class XAxisLayer extends React.Component<OwnProps & ConnectedProps, {}> {
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

export default connect(mapStateToProps)(XAxisLayer) as React.ComponentClass<OwnProps>;
