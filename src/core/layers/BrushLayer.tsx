import * as React from 'react';
import * as PureRender from 'pure-render-decorator';

import SpanLayer from './SpanLayer';
import propTypes from '../propTypes';
import { Interval, Color } from '../interfaces';

export interface Props {
  xDomain: Interval;
  selection?: Interval;
  stroke?: Color;
  fill?: Color;
}

@PureRender
export default class BrushLayer extends React.Component<Props, void> {
  static propTypes = {
    selection: propTypes.interval,
    xDomain: propTypes.interval.isRequired,
    stroke: React.PropTypes.string,
    fill: React.PropTypes.string
  } as React.ValidationMap<Props>;

  static defaultProps = {
    stroke: 'rgba(0, 0, 0, 0.7)',
    fill: 'rgba(0, 0, 0, 0.1)'
  } as any as Props;

  render() {
    const data = this.props.selection
      ? [{ minXValue: this.props.selection.min, maxXValue: this.props.selection.max }]
      : [];
    return <SpanLayer
      data={data}
      xDomain={this.props.xDomain}
      fillColor={this.props.fill}
      borderColor={this.props.stroke}
    />;
  }
}
