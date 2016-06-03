import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import propTypes from '../propTypes';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import { Range, ScaleFunction, Ticks, TickFormat, Color } from '../interfaces';

// TODO: Do any of these need to be configurable?
const DEFAULT_TICK_COUNT = 5;

export interface YAxisSpec {
  yDomain: Range;
  scale?: ScaleFunction;
  ticks?: Ticks;
  tickFormat?: TickFormat;
  color?: Color;
  axisId?: string;
}

interface YAxisProps extends YAxisSpec {
  font?: string;
  backgroundColor: Color;
}

interface YAxisState {
  width: number;
  height: number;
}

@PureRender
class YAxis extends React.Component<YAxisProps, YAxisState> {
  static defaultProps = {
    color: '#444',
  } as any;

  render() {
    const yScale = (this.props.scale || d3Scale.scaleLinear)()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .rangeRound([ 0, 100 ]);

    let ticks: number[];
    const inputTicks = this.props.ticks;
    if (inputTicks) {
      if (_.isFunction(inputTicks)) {
        ticks = inputTicks(this.props.yDomain);
      } else if (_.isArray<number>(inputTicks)) {
        ticks = inputTicks;
      } else if (_.isNumber(inputTicks)) {
        ticks = yScale.ticks(inputTicks);
      } else {
        throw new Error('ticks must be a function, array or number');
      }
    } else {
      ticks = yScale.ticks(DEFAULT_TICK_COUNT);
    }
    const tickCount = _.isNumber(inputTicks) ? inputTicks : DEFAULT_TICK_COUNT;
    const format = yScale.tickFormat(tickCount, this.props.tickFormat);

    let tickMarks = [];
    for (let i = 0; i < ticks.length; ++i) {
      tickMarks.push(
        <div className='tick' style={{ top: `${100 - yScale(ticks[i])}%` }}>
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
    axes: React.PropTypes.arrayOf(React.PropTypes.shape({
      yDomain: propTypes.range.isRequired,
      scale: React.PropTypes.func,
      ticks: React.PropTypes.oneOfType([
        React.PropTypes.func,
        React.PropTypes.number,
        React.PropTypes.arrayOf(React.PropTypes.number)
      ]),
      tickFormat: React.PropTypes.oneOfType([
        React.PropTypes.func,
        React.PropTypes.string
      ]),
      color: React.PropTypes.string
    })).isRequired,
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
            key={axis.axisId || i}
          />
        ))}
      </div>
    );
  }
}
