import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import propTypes from '../propTypes';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import { computeTicks } from '../renderUtils';
import { Interval, AxisSpec } from '../interfaces';

export interface Props extends AxisSpec {
  yDomain: Interval;
}

@PureRender
class YAxis extends React.Component<Props, void> {
  static propTypes = _.defaults({
    yDomain: propTypes.interval.isRequired
  }, propTypes.axisSpecPartial) as any as React.ValidationMap<Props>;

  static defaultProps = {
    scale: d3Scale.scaleLinear
  } as any as Props;

  render() {
    const yScale = this.props.scale()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .rangeRound([ 0, 100 ]);

    const { ticks, format } = computeTicks(yScale, this.props.ticks, this.props.tickFormat);

    return (
      <div className='y-axis' style={{
        color: this.props.color,
        borderRightColor: this.props.color
      }}>
        {ticks.map((tick, i) =>
          <div className='tick' style={{ top: `${100 - yScale(tick)}%` }} key={i}>
            <span className='label'>{format(tick)}</span>
            <span className='mark' style={{ borderBottomColor: this.props.color }}/>
          </div>
        )}
      </div>
    );
  }
}

export default wrapWithAnimatedYDomain(YAxis);
