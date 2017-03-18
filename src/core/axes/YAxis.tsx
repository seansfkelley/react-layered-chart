import * as React from 'react';
import * as d3Scale from 'd3-scale';

import propTypes from '../propTypes';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import { computeTicks } from '../renderUtils';
import { Interval, AxisSpec } from '../interfaces';

export interface Props extends AxisSpec {
  yDomain: Interval;
}

class YAxis extends React.PureComponent<Props, void> {
  static propTypes: React.ValidationMap<Props> = {
    ...propTypes.axisSpecPartial,
    yDomain: propTypes.interval.isRequired
  };

  static defaultProps: Partial<Props> = {
    scale: d3Scale.scaleLinear
  };

  render() {
    const yScale = this.props.scale!()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .range([ 0, 100 ]);

    const { ticks, format } = computeTicks(yScale, this.props.ticks, this.props.tickFormat);

    return (
      <div className='y-axis' style={{
        color: this.props.color,
        borderRightColor: this.props.color
      }}>
        {ticks.map((tick, i) =>
          <div className='tick' style={{ top: `calc(${100 - yScale(tick)}% - 0.5px)` }} key={i}>
            <span className='label'>{format(tick)}</span>
            <span className='mark' style={{ borderBottomColor: this.props.color }}/>
          </div>
        )}
      </div>
    );
  }
}

export default wrapWithAnimatedYDomain(YAxis);
