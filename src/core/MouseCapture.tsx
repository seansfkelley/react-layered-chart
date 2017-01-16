import * as React from 'react';
import * as classNames from 'classnames';
import * as d3Scale from 'd3-scale';

const LEFT_MOUSE_BUTTON = 0;

export interface Props {
  className?: string;
  zoomSpeed?: number | ((e: React.WheelEvent<HTMLElement>) => number);
  onZoom?: (factor: number, xPct: number, yPct: number, e: React.WheelEvent<HTMLElement>) => void;
  onDragStart?: (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement>) => void;
  onDrag?: (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement>) => void;
  onDragEnd?: (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement>) => void;
  onClick?: (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement>) => void;
  onHover?: (xPct: number | undefined, yPct: number | undefined, e: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
}

export interface State {
  mouseDownClientX?: number;
  mouseDownClientY?: number;
  lastMouseMoveClientX?: number;
  lastMouseMoveClientY?: number;
}

export default class MouseCapture extends React.PureComponent<Props, State> {
  static propTypes = {
    className: React.PropTypes.string,
    zoomSpeed: React.PropTypes.oneOfType([
       React.PropTypes.number,
       React.PropTypes.func
    ]),
    onZoom: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    onDrag: React.PropTypes.func,
    onDragEnd: React.PropTypes.func,
    onHover: React.PropTypes.func,
    onClick: React.PropTypes.func,
    children: React.PropTypes.oneOfType([
       React.PropTypes.element,
       React.PropTypes.arrayOf(React.PropTypes.element)
    ])
  };

  static defaultProps = {
    zoomSpeed: 0.05
  } as any as Props;

  private element: HTMLDivElement;

  state: State = {};

  render() {
    return (
      <div
        className={classNames('lc-mouse-capture', this.props.className)}
        onMouseDown={this._onMouseDown}
        onMouseUp={this._onMouseUp}
        onMouseMove={this._onMouseMove}
        onMouseLeave={this._onMouseLeave}
        onWheel={this._onWheel}
        ref={element => { this.element = element; }}
      >
        {this.props.children}
      </div>
    );
  }

  private _createPhysicalToLogicalScales() {
    const { left, right, top, bottom } = this.element.getBoundingClientRect();
    return {
      xScale: d3Scale.scaleLinear()
        .domain([ left, right ])
        .range([ 0, 1 ]),
      yScale: d3Scale.scaleLinear()
        .domain([ top, bottom ])
        .range([ 0, 1 ])
    };
  }

  private _clearState() {
    this.setState({
      mouseDownClientX: undefined,
      mouseDownClientY: undefined,
      lastMouseMoveClientX: undefined,
      lastMouseMoveClientY: undefined
    });
  }

  private _onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (e.button === LEFT_MOUSE_BUTTON) {
      this.setState({
        mouseDownClientX: e.clientX,
        mouseDownClientY: e.clientY,
        lastMouseMoveClientX: e.clientX,
        lastMouseMoveClientY: e.clientY
      });

      if (this.props.onDragStart) {
        const { xScale, yScale } = this._createPhysicalToLogicalScales();
        this.props.onDragStart(xScale(e.clientX), yScale(e.clientY), e);
      }
    }
  };

  private _maybeDispatchDragHandler(e: React.MouseEvent<HTMLElement>, handler?: (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement>) => void) {
    if (e.button === LEFT_MOUSE_BUTTON && handler && this.state.mouseDownClientX != null) {
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      handler(
        xScale(e.clientX),
        yScale(e.clientY),
        e
      );
    }
  }

  private _onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    this._maybeDispatchDragHandler(e, this.props.onDrag);

    if (this.props.onHover) {
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      this.props.onHover(xScale(e.clientX), yScale(e.clientY), e);
    }

    this.setState({
      lastMouseMoveClientX: e.clientX,
      lastMouseMoveClientY: e.clientY
    });
  };

  private _onMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    this._maybeDispatchDragHandler(e, this.props.onDragEnd);

    if (e.button === LEFT_MOUSE_BUTTON && this.props.onClick && Math.abs(this.state.mouseDownClientX - e.clientX) <= 2 && Math.abs(this.state.mouseDownClientY - e.clientY) <= 2) {
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      this.props.onClick(xScale(e.clientX), yScale(e.clientY), e);
    }

    this._clearState();
  };

  private _onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    this._maybeDispatchDragHandler(e, this.props.onDragEnd);

    if (this.props.onHover) {
      this.props.onHover(undefined, undefined, e);
    }

    this._clearState();
  };

  private _onWheel = (e: React.WheelEvent<HTMLElement>) => {
    if (this.props.onZoom && e.deltaY) {
      const zoomSpeed = typeof this.props.zoomSpeed === 'function'
        // Why doesn't the compiler accept this type guard?
        ? (this.props.zoomSpeed as any as Function)(e)
        : this.props.zoomSpeed;
      const zoomFactor = Math.exp(-e.deltaY * zoomSpeed);
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      this.props.onZoom(zoomFactor, xScale(e.clientX), yScale(e.clientY), e);
    }
  };
}
