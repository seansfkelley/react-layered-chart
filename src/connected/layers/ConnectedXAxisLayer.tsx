import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Interval, Color, ScaleFunction, Ticks, TickFormat, XAxisLayer as UnconnectedXAxisLayer} from '../../core';
import { ChartState } from '../model/state';
import { selectXDomain } from '../model/selectors';

export interface OwnProps {
  scale?: ScaleFunction;
  ticks?: Ticks;
  tickFormat?: TickFormat;
  color?: Color;
  font?: string;
}

export interface ConnectedProps {
  xDomain: Interval;
}

@PureRender
export class ConnectedXAxisLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <UnconnectedXAxisLayer {...this.props}/>
    );
  }
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(ConnectedXAxisLayer) as React.ComponentClass<OwnProps>;
