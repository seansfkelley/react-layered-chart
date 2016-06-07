import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import propTypes from '../propTypes';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import { computeTicks } from '../renderUtils';
import { Interval, ScaleFunction, Ticks, TickFormat, Color, AxisSpec } from '../interfaces';

const DEFAULT_TICK_COUNT = 5;

export interface YAxisSpec extends AxisSpec {
  yDomain: Interval;
  axisId?: number | string;
}

interface YAxisProps extends YAxisSpec {
  font?: string;
  backgroundColor: Color;
}

@PureRender
class YAxis extends React.Component<YAxisProps, void> {
  static defaultProps = {
    color: '#444',
  } as any;

  render() {
    const yScale = (this.props.scale || d3Scale.scaleLinear)()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .rangeRound([ 0, 100 ]);

    const { ticks, format } = computeTicks(yScale, this.props.ticks, this.props.tickFormat);

    let tickMarks = [];
    for (let i = 0; i < ticks.length; ++i) {
      tickMarks.push(
        <div className='tick' style={{ top: `${100 - yScale(ticks[i])}%` }} key={i}>
          <span className='label'>{format(ticks[i])}</span>
          <span className='mark' style={{ borderBottomColor: this.props.color }}/>
        </div>
      );
    }

    return (
      <div className='single-y-axis' style={{
        color: this.props.color,
        backgroundColor: this.props.backgroundColor,
        font: this.props.font,
        borderRightColor: this.props.color
      }}>
        {tickMarks}
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
  context: Context;

  static propTypes = {
    axes: React.PropTypes.arrayOf(React.PropTypes.shape(_.defaults({
      yDomain: propTypes.interval.isRequired,
      axisId: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number,
      ])
    } as React.ValidationMap<any>, propTypes.axisSpecPartial))).isRequired,
    font: React.PropTypes.string,
    backgroundColor: React.PropTypes.string
  };

  static defaultProps = {
    font: '12px sans-serif',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  };

  render() {
    return (
      <div className='y-axis-container'>
        {this.props.axes.map((axis, i) => (
          <AnimatedYAxis
            {...axis}
            font={this.props.font}
            backgroundColor={this.props.backgroundColor}
            key={_.isEmpty(axis.axisId) ? i : axis.axisId}
          />
        ))}
      </div>
    );
  }
}
