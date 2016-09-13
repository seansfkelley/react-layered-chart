import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';
import { deprecate } from 'react-is-deprecated';

import propTypes from '../propTypes';
import { computeTicks } from '../renderUtils';
import { Interval, AxisSpec } from '../interfaces';

export interface Props extends AxisSpec {
  xDomain: Interval;
  font?: string;
}

@PureRender
export default class XAxisLayer extends React.Component<Props, void> {
  static propTypes = _.defaults({
    xDomain: propTypes.interval.isRequired,
    font: deprecate(React.PropTypes.string, 'XAxisLayer\'s \'font\' prop is deprecated. Use CSS rules instead.')
  }, propTypes.axisSpecPartial) as any as React.ValidationMap<Props>;

  static defaultProps = {
    scale: d3Scale.scaleTime,
    color: '#444'
  } as any as Props;

  render() {
    const xScale = this.props.scale()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .range([ 0, 100 ]);

    const { ticks, format } = computeTicks(xScale, this.props.ticks, this.props.tickFormat);

    return (
      <div className='x-axis-layer' style={{ font: this.props.font }}>
        {ticks.map((tick, i) =>
          <div className='tick' style={{ left: `${xScale(tick)}%`, color: this.props.color }} key={i}>
            <span className='label' style={{ borderColor: this.props.color }}>{format(tick)}</span>
          </div>
        )}
      </div>
    );
  }
}
