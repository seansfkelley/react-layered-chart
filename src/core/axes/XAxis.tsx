import * as React from 'react';
import { scaleTime } from 'd3-scale';
import * as _ from 'lodash';

import propTypes from '../propTypes';
import { computeTicks } from '../renderUtils';
import { Interval, AxisSpec } from '../interfaces';

export interface Props extends AxisSpec {
  xDomain: Interval;
}

export default class XAxis extends React.PureComponent<Props, void> {
  static propTypes = _.defaults({
    xDomain: propTypes.interval.isRequired,
  }, propTypes.axisSpecPartial) as any as React.ValidationMap<Props>;

  static defaultProps = {
    scale: scaleTime
  } as any as Props;

  render() {
    const xScale = this.props.scale!()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .range([ 0, 100 ]);

    const { ticks, format } = computeTicks(xScale, this.props.ticks, this.props.tickFormat);

    return (
      <div className='x-axis' style={{
        color: this.props.color
      }}>
        {ticks.map((tick, i) =>
          <div className='tick' style={{ left: `calc(${xScale(tick)}% + 1px)` }} key={i}>
            <span className='label' style={{ borderColor: this.props.color }}>{format(tick)}</span>
          </div>
        )}
      </div>
    );
  }
}
