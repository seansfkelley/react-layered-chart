import * as React from 'react';

import propTypes from '../propTypes';
import { Interval, BooleanMouseEventHandler } from '../interfaces';
import MouseCapture from '../MouseCapture';

const LEFT_MOUSE_BUTTON = 0;

export const DEFAULT_SHOULD_ZOOM: BooleanMouseEventHandler = () => true;
export const DEFAULT_SHOULD_PAN: BooleanMouseEventHandler = (event) => !event.shiftKey && event.button === LEFT_MOUSE_BUTTON;
export const DEFAULT_SHOULD_BRUSH: BooleanMouseEventHandler = (event) => event.shiftKey && event.button === LEFT_MOUSE_BUTTON;
export const DEFAULT_SHOULD_HOVER: BooleanMouseEventHandler = () => true;

export interface Props {
  xDomain: Interval;
  shouldZoom?: BooleanMouseEventHandler;
  shouldPan?: BooleanMouseEventHandler;
  shouldBrush?: BooleanMouseEventHandler;
  shouldHover?: BooleanMouseEventHandler;
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

export default class InteractionCaptureLayer extends React.PureComponent<Props, State> {
  static propTypes: React.ValidationMap<Props> = {
    shouldZoom: React.PropTypes.func,
    shouldPan: React.PropTypes.func,
    shouldBrush: React.PropTypes.func,
    shouldHover: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onPan: React.PropTypes.func,
    onBrush: React.PropTypes.func,
    onHover: React.PropTypes.func,
    xDomain: propTypes.interval.isRequired,
    zoomSpeed: React.PropTypes.number
  };

  static defaultProps: Partial<Props> = {
    zoomSpeed: 0.05
  };

  state: State = {
    isPanning: false,
    isBrushing: false
  };

  render() {
    return (
      <MouseCapture
        className='interaction-capture-layer'
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

  private _dispatchPanAndBrushEvents(xPct: number, _yPct: number, _e: React.MouseEvent<HTMLElement>) {
    if (this.props.onPan && this.state.isPanning) {
      this.props.onPan(this._xPctToDomain(this.state.lastPanXPct!) - this._xPctToDomain(xPct));
      this.setState({ lastPanXPct: xPct });
    } else if (this.props.onBrush && this.state.isBrushing) {
      const a = this._xPctToDomain(this.state.startBrushXPct!);
      const b = this._xPctToDomain(xPct);
      this.props.onBrush({ min: Math.min(a, b), max: Math.max(a, b) });
    }
  }

  private _xPctToDomain(xPct: number) {
    return this.props.xDomain.min + (this.props.xDomain.max - this.props.xDomain.min) * xPct;
  }

  private _onZoom = (factor: number, xPct: number, _yPct: number, e: React.WheelEvent<HTMLElement>) => {
    if (this.props.onZoom && this.props.shouldZoom && this.props.shouldZoom(e)) {
      e.preventDefault();
      this.props.onZoom(factor, xPct);
    }
  };

  private _onDragStart = (xPct: number, _yPct: number, e: React.MouseEvent<HTMLElement>) => {
    if (this.props.onPan && this.props.shouldPan && this.props.shouldPan(e)) {
      this.setState({ isPanning: true, lastPanXPct: xPct });
    } else if (this.props.onBrush && this.props.shouldBrush && this.props.shouldBrush(e)) {
      this.setState({ isBrushing: true, startBrushXPct: xPct });
    }
  };

  private _onDrag = (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement>) => {
    this._dispatchPanAndBrushEvents(xPct, yPct, e);
  };

  private _onDragEnd = (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement>) => {
    this._dispatchPanAndBrushEvents(xPct, yPct, e);
    this.setState({
      isPanning: false,
      isBrushing: false,
      lastPanXPct: undefined,
      startBrushXPct: undefined
    });
  };

  private _onClick = (_xPct: number, _yPct: number, e: React.MouseEvent<HTMLElement>) => {
    if (this.props.onBrush && this.props.shouldBrush && this.props.shouldBrush(e)) {
      this.props.onBrush(undefined);
    }
  };

  private _onHover = (xPct: number, _yPct: number, e: React.MouseEvent<HTMLElement>) => {
    if (this.props.onHover && this.props.shouldHover && this.props.shouldHover(e)) {
      if (xPct != null) {
        this.props.onHover(this._xPctToDomain(xPct));
      } else {
        this.props.onHover(undefined);
      }
    }
  };
}
