import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';

import propTypes from '../propTypes';
import { Interval, BooleanMouseEventHandler } from '../interfaces';
import MouseCapture from '../MouseCapture';

const LEFT_MOUSE_BUTTON = 0;

export interface Props {
  xDomain: Interval;
  shouldZoom?: BooleanMouseEventHandler;
  shouldPan?: BooleanMouseEventHandler;
  shouldBrush?: BooleanMouseEventHandler;
  onZoom?: (factor: number, anchorBias: number) => void;
  onPan?: (logicalUnits: number) => void;
  onBrush?: (logicalUnitInterval?: Interval) => void;
  onHover?: (logicalPosition?: number) => void;
  zoomSpeed?: number;
}

export interface State {
  isPanning: boolean;
  isBrushing: boolean;
  lastPanXPct?: number;
  startBrushXPct?: number;
}

@PureRender
export default class InteractionCaptureLayer extends React.Component<Props, State> {
  static propTypes = {
    shouldZoom: React.PropTypes.func,
    shouldPan: React.PropTypes.func,
    shouldBrush: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onPan: React.PropTypes.func,
    onBrush: React.PropTypes.func,
    onHover: React.PropTypes.func,
    xDomain: propTypes.interval.isRequired,
    zoomSpeed: React.PropTypes.number
  } as React.ValidationMap<Props>;

  static defaultProps = {
    shouldZoom: (event) => true,
    shouldPan: (event) => !event.shiftKey && event.button === LEFT_MOUSE_BUTTON,
    shouldBrush: (event) => event.shiftKey && event.button === LEFT_MOUSE_BUTTON,
    zoomSpeed: 0.05
  } as any as Props;

  state: State = {
    isPanning: false,
    isBrushing: false
  };

  render() {
    return (
      <MouseCapture
        className='interaction-capture interaction-capture-layer'
        zoomSpeed={this.props.zoomSpeed}
        onZoom={this._onZoom}
        onDragStart={this._onDragStart}
        onDrag={this._onDrag}
        onDragEnd={this._onDragEnd}
        onClick={this._onClick}
        onHover={this._onHover}
      />
    );
  }

  private _dispatchPanAndBrushEvents(xPct: number, yPct: number, e: React.MouseEvent) {
    if (this.props.onPan && this.state.isPanning) {
      this.props.onPan(this._xPctToDomain(this.state.lastPanXPct) - this._xPctToDomain(xPct));
      this.setState({ lastPanXPct: xPct } as any);
    } else if (this.props.onBrush && this.state.isBrushing) {
      const a = this._xPctToDomain(this.state.startBrushXPct);
      const b = this._xPctToDomain(xPct);
      this.props.onBrush({ min: Math.min(a, b), max: Math.max(a, b) });
    }
  }

  private _xPctToDomain(xPct: number) {
    return this.props.xDomain.min + (this.props.xDomain.max - this.props.xDomain.min) * xPct;
  }

  private _onZoom = (factor: number, xPct: number, yPct: number, e: React.WheelEvent) => {
    if (this.props.onZoom && this.props.shouldZoom(e)) {
      e.stopPropagation();
      e.preventDefault();
      this.props.onZoom(factor, xPct);
    }
  };

  private _onDragStart = (xPct: number, yPct: number, e: React.MouseEvent) => {
    if (this.props.onPan && this.props.shouldPan(e)) {
      this.setState({ isPanning: true, lastPanXPct: xPct } as any);
    } else if (this.props.onBrush && this.props.shouldBrush(e)) {
      this.setState({ isBrushing: true, startBrushXPct: xPct } as any);
    }
  };

  private _onDrag = (xPct: number, yPct: number, e: React.MouseEvent) => {
    this._dispatchPanAndBrushEvents(xPct, yPct, e);
  };

  private _onDragEnd = (xPct: number, yPct: number, e: React.MouseEvent) => {
    this._dispatchPanAndBrushEvents(xPct, yPct, e);
    this.setState({
      isPanning: false,
      isBrushing: false,
      lastPanXPct: null,
      startBrushXPct: null
    });
  };

  private _onClick = (xPct: number, yPct: number, e: React.MouseEvent) => {
    if (this.props.onBrush && this.props.shouldBrush(e)) {
      this.props.onBrush(null);
    }
  };

  private _onHover = (xPct: number, yPct: number, e: React.MouseEvent) => {
    if (this.props.onHover) {
      if (xPct != null) {
        this.props.onHover(this._xPctToDomain(xPct));
      } else {
        this.props.onHover(null);
      }
    }
  };
}
