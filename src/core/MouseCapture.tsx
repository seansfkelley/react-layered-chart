import * as React from 'react';
import * as classNames from 'classnames';
import * as d3Scale from 'd3-scale';

const LEFT_MOUSE_BUTTON = 0;

export interface Props {
  className?: string;
  zoomSpeed?: number | ((e: React.WheelEvent<HTMLElement>) => number);
  onZoom?: (factor: number, xPct: number, yPct: number, e: React.WheelEvent<HTMLElement>) => void;
  onDragStart?: (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement> | MouseEvent) => void;
  onDrag?: (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement> | MouseEvent) => void;
  onDragEnd?: (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement> | MouseEvent) => void;
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

  componentWillUnmount() {
    this._removeWindowMouseEventHandlers();
  }

  render() {
    return (
      <div
        className={classNames('lc-mouse-capture', this.props.className)}
        onMouseDown={this._onMouseDownInCaptureArea}
        onMouseMove={this._onMouseMoveInCaptureArea}
        onMouseUp={this._onMouseUpInCaptureArea}
        onMouseLeave={this._onMouseLeaveCaptureArea}
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

  private _maybeDispatchDragHandler(
    e: React.MouseEvent<HTMLElement> | MouseEvent,
    handler?: (xPct: number, yPct: number, e: React.MouseEvent<HTMLElement> | MouseEvent) => void
  ) {
    if (e.button === LEFT_MOUSE_BUTTON && handler && this.state.mouseDownClientX != null) {
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      const { left, right, top, bottom } = this.element.getBoundingClientRect();
      handler(
        xScale(Math.min(Math.max(e.clientX, left), right)),
        yScale(Math.min(Math.max(e.clientY, bottom), top)),
        e
      );
    }
  }

  private _addWindowMouseEventHandlers = () => {
    window.addEventListener('mousemove', this._onMouseMoveInWindow);
    window.addEventListener('mouseup', this._onMouseUpInWindow);
  }

  private _removeWindowMouseEventHandlers = () => {
    window.removeEventListener('mousemove', this._onMouseMoveInWindow);
    window.removeEventListener('mouseup', this._onMouseUpInWindow);
  }

  private _onMouseDownInCaptureArea = (e: React.MouseEvent<HTMLElement>) => {
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

      this._removeWindowMouseEventHandlers();
      this._addWindowMouseEventHandlers();
    }
  };

  private _onMouseMoveInCaptureArea = (e: React.MouseEvent<HTMLElement>) => {
    if (this.props.onHover) {
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      this.props.onHover(xScale(e.clientX), yScale(e.clientY), e);

      // If onHover exists, event.stopPropagation is called and the window event does not get called.
      if (this.state.mouseDownClientX != null) {
        this._onMouseMoveInWindow(e.nativeEvent as MouseEvent);
      }
    }
  };

  private _onMouseUpInCaptureArea = (e: React.MouseEvent<HTMLElement>) => {
    if (e.button === LEFT_MOUSE_BUTTON && this.props.onClick && Math.abs(this.state.mouseDownClientX! - e.clientX) <= 2 && Math.abs(this.state.mouseDownClientY - e.clientY) <= 2) {
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      this.props.onClick(xScale(e.clientX), yScale(e.clientY), e);
    }

    this._onMouseUpInWindow(e.nativeEvent as MouseEvent);
  }

  private _onMouseMoveInWindow = (e: MouseEvent) => {
    this._maybeDispatchDragHandler(e, this.props.onDrag);

    this.setState({
      lastMouseMoveClientX: e.clientX,
      lastMouseMoveClientY: e.clientY
    });
  }

  private _onMouseUpInWindow = (e: MouseEvent) => {
    this._maybeDispatchDragHandler(e, this.props.onDragEnd);
    this._removeWindowMouseEventHandlers();
    this._clearState();
  };

  private _onMouseLeaveCaptureArea = (e: React.MouseEvent<HTMLElement>) => {
    if (this.props.onHover) {
      this.props.onHover(undefined, undefined, e);
    }
  };

  private _onWheel = (e: React.WheelEvent<HTMLElement>) => {
    // In Chrome, shift + wheel results in horizontal scrolling and
    // deltaY == 0 while deltaX != 0, and deltaX should be used instead
    const delta = e.shiftKey ? e.deltaY || e.deltaX : e.deltaY;
    if (this.props.onZoom && delta) {
      const zoomSpeed = typeof this.props.zoomSpeed === 'function'
        // Why doesn't the compiler accept this type guard?
        ? (this.props.zoomSpeed as any as Function)(e)
        : this.props.zoomSpeed;
      const zoomFactor = Math.exp(-delta * zoomSpeed);
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      this.props.onZoom(zoomFactor, xScale(e.clientX), yScale(e.clientY), e);
    }
  };
}
