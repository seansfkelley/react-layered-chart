import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';
import { deprecate } from 'react-is-deprecated';

import propTypes from '../propTypes';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import { computeTicks } from '../renderUtils';
import { Interval, Color, AxisSpec } from '../interfaces';

export interface YAxisSpec extends AxisSpec {
  yDomain: Interval;
  axisId?: number | string;
}

@PureRender
class YAxis extends React.Component<YAxisSpec, void> {
  static defaultProps = {
    color: '#444',
  } as any as YAxisSpec;

  render() {
    const yScale = (this.props.scale || d3Scale.scaleLinear)()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .range([ 0, 100 ]);

    const { ticks, format } = computeTicks(yScale, this.props.ticks, this.props.tickFormat);

    return (
      <div className='single-y-axis' style={{
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

const AnimatedYAxis = wrapWithAnimatedYDomain(YAxis);

export interface Props {
  axes: YAxisSpec[];
  font?: string;
  backgroundColor?: Color;
}

@PureRender
export default class YAxisLayer extends React.Component<Props, void> {
  static propTypes = {
    axes: React.PropTypes.arrayOf(React.PropTypes.shape(_.defaults({
      yDomain: propTypes.interval.isRequired,
      axisId: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number,
      ])
    } as React.ValidationMap<any>, propTypes.axisSpecPartial))).isRequired,
    font: deprecate(React.PropTypes.string, 'YAxisLayer\'s \'font\' prop is deprecated. Use CSS rules instead.'),
    backgroundColor: React.PropTypes.string
  } as any as React.ValidationMap<Props>;

  static defaultProps = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  } as any as Props;

  render() {
    return (
      <div
        className='y-axis-container y-axis-layer'
        style={{
          font: this.props.font,
          backgroundColor: this.props.backgroundColor
        }}
      >
        {this.props.axes.map((axis, i) => (
          <AnimatedYAxis
            {...axis}
            key={_.isEmpty(axis.axisId) ? i : axis.axisId}
          />
        ))}
      </div>
    );
  }
}
