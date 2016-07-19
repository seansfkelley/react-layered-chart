import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';
import { deprecate } from 'react-is-deprecated';

import { Context } from '../decorators/PixelRatioContext';

import propTypes from '../propTypes';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import { computeTicks } from '../renderUtils';
import { Interval, Color, AxisSpec, BooleanMouseEventHandlerWithId } from '../interfaces';
import InteractionCaptureLayer, {Direction} from './InteractionCaptureLayer';

export interface YAxisControls {
  shouldZoom?: BooleanMouseEventHandlerWithId;
  shouldPan?: BooleanMouseEventHandlerWithId;
  onZoom?: (factor: number, anchorBias: number, axisId: number | string) => void;
  onPan?: (logicalUnits: number, axisId: number | string) => void;
  zoomSpeed?: number;
}

export interface YAxisSpec extends AxisSpec {
  yDomain: Interval;
  axisId?: number | string;
}

@PureRender
class YAxis extends React.Component<YAxisSpec & YAxisControls, void> {
  static defaultProps = {
    color: '#444',
    shouldPan: () => true,
    shouldZoom: () => true
  } as any as YAxisSpec;

  render() {
    const yScale = (this.props.scale || d3Scale.scaleLinear)()
      .domain([ this.props.yDomain.min, this.props.yDomain.max ])
      .rangeRound([ 0, 100 ]);

    const { ticks, format } = computeTicks(yScale, this.props.ticks, this.props.tickFormat);

    return (
      <div className='single-y-axis' style={{
        color: this.props.color,
        borderRightColor: this.props.color
      }}>
        {ticks.map((tick, i) =>
          <div className='tick' style={{ top: `${100 - yScale(tick)}%` }} key={i}>
            <span className='label'>{format(tick)}</span>
            <span className='mark' style={{ borderBottomColor: this.props.color }}/>
          </div>
        )}
        <InteractionCaptureLayer
          direction={Direction.VERTICAL}
          domain={this.props.yDomain}
          onZoom={this._zoom}
          onPan={this._pan}
          shouldZoom={(event) => this.props.shouldZoom(event, this.props.axisId)}
          shouldPan={(event) => this.props.shouldPan(event, this.props.axisId)}
          shouldBrush={() => false}
          zoomSpeed={this.props.zoomSpeed}
        />
      </div>
    );
  }

  private _zoom = (factor: number, anchorBias: number) => {
    if (this.props.onZoom) {
      // Y Axis display is inverted compared to DOM mouse location, invert anchorBias accordingly.
      this.props.onZoom(factor, -anchorBias + 1.0, this.props.axisId);
    }
  };

  private _pan = (logicalUnits: number) => {
    if (this.props.onPan) {
      // Y Axis display is inverted compared to DOM mouse location, invert pan actions accordingly.
      this.props.onPan(-logicalUnits, this.props.axisId);
    }
  };
}

const AnimatedYAxis = wrapWithAnimatedYDomain(YAxis);

export interface Props extends YAxisControls {
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
    font: deprecate(React.PropTypes.string, 'YAxisLayer\'s \'font\' prop is deprecated. Use CSS rules instead.'),
    backgroundColor: React.PropTypes.string,
    shouldZoom: React.PropTypes.func,
    shouldPan: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onPan: React.PropTypes.func,
    zoomSpeed: React.PropTypes.number
  };

  static defaultProps = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  };

  render() {
    const axisControls: YAxisControls = _.pick(this.props, ['shouldZoom', 'shouldPan', 'onZoom', 'onPan', 'zoomSpeed']);
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
            {...axisControls}
            key={_.isEmpty(axis.axisId) ? i : axis.axisId}
          />
        ))}
      </div>
    );
  }
}
