import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';

import propTypes from '../propTypes';
import { Interval, BooleanMouseEventHandler } from '../interfaces';

const LEFT_MOUSE_BUTTON = 0;

export enum Direction {
  HORIZONTAL, VERTICAL
}

export interface Props {
  direction?: Direction;
  domain: Interval;
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
  lastPanClient?: number;
  startBrushClient?: number;
}

@PureRender
export default class InteractionCaptureLayer extends React.Component<Props, State> {
  static propTypes = {
    direction: React.PropTypes.number,
    shouldZoom: React.PropTypes.func,
    shouldPan: React.PropTypes.func,
    shouldBrush: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onPan: React.PropTypes.func,
    onBrush: React.PropTypes.func,
    onHover: React.PropTypes.func,
    domain: propTypes.interval.isRequired,
    zoomSpeed: React.PropTypes.number
  } as React.ValidationMap<Props>;

  static defaultProps = {
    direction: Direction.HORIZONTAL,
    shouldZoom: (event) => true,
    shouldPan: (event) => !event.shiftKey && event.button === LEFT_MOUSE_BUTTON,
    shouldBrush: (event) => event.shiftKey && event.button === LEFT_MOUSE_BUTTON,
    zoomSpeed: 0.05
  } as any as Props;

  state = {
    isPanning: false,
    isBrushing: false,
    lastPanClient: null,
    startBrushClient: null
  };

  render() {
    return (
      <div
        className='interaction-capture interaction-capture-layer'
        onMouseDown={this._onMouseDown}
        onMouseUp={this._onMouseUp}
        onMouseMove={this._onMouseMove}
        onMouseLeave={this._onMouseLeave}
        onWheel={this._onWheel}
        ref='layer'
      />
    );
  }

  private _getBoundingClientRect() {
    return (this.refs['layer'] as Element).getBoundingClientRect();
  }

  private _isHorizontal() {
    return this.props.direction === Direction.HORIZONTAL;
  }

  private _createPhysicalToLogicalScale() {
    const boundingClientRect = this._getBoundingClientRect();
    const domain = (this._isHorizontal() ?
        [boundingClientRect.left, boundingClientRect.right] :
        [boundingClientRect.top, boundingClientRect.bottom]
    );
    return d3Scale.scaleLinear()
      .domain(domain)
      .range([ this.props.domain.min, this.props.domain.max ]);
  }

  private _getEventLocation(event): number {
    return this._isHorizontal() ? event.clientX : event.clientY;
  }

  private _dispatchPanAndBrushEvents(event) {
    var eventLocation = this._getEventLocation(event);
    if (this.props.onPan && this.state.isPanning) {
      if (this.state.lastPanClient !== eventLocation) {
        const scale = this._createPhysicalToLogicalScale();
        this.setState({ lastPanClient: eventLocation } as any);
        this.props.onPan(scale(this.state.lastPanClient) - scale(eventLocation));
      } else {
        // Do nothing.
      }
    } else if (this.props.onBrush && this.state.isBrushing) {
      if (Math.abs(this.state.startBrushClient - eventLocation) > 2) {
        const scale = this._createPhysicalToLogicalScale();
        const a = scale(this.state.startBrushClient);
        const b = scale(eventLocation);
        this.props.onBrush({ min: Math.min(a, b), max: Math.max(a, b) });
      } else {
        this.props.onBrush(null);
      }
    }
  }

  private _clearPanAndBrushState() {
    this.setState({
      isPanning: false,
      isBrushing: false,
      lastPanClient: null,
      startBrushClient: null
    });
  }

  private _onMouseDown = (event) => {
    if (this.props.onPan && this.props.shouldPan(event)) {
      this.setState({ isPanning: true, lastPanClient: this._getEventLocation(event) } as any);
    } else if (this.props.onBrush && this.props.shouldBrush(event)) {
      this.setState({ isBrushing: true, startBrushClient: this._getEventLocation(event) } as any);
      this.props.onHover(null);
    }
    event.stopPropagation();
  };

  private _onMouseUp = (event) => {
    this._dispatchPanAndBrushEvents(event);
    this._clearPanAndBrushState();
    event.stopPropagation();
  };

  private _onMouseMove = (event) => {
    this._dispatchPanAndBrushEvents(event);
    if (this.props.onHover && !this.state.isPanning && !this.state.isBrushing) {
      const scale = this._createPhysicalToLogicalScale();
      this.props.onHover(scale(this._getEventLocation(event)));
    }
    event.stopPropagation();
  };

  private _onMouseLeave = (event) => {
    this._dispatchPanAndBrushEvents(event);
    this._clearPanAndBrushState();
    if (this.props.onHover) {
      this.props.onHover(null);
    }
    event.stopPropagation();
  };

  private _onWheel = (event) => {
    if (this.props.onZoom && event.deltaY && this.props.shouldZoom(event)) {
      const boundingClientRect = this._getBoundingClientRect();
      const focus = (this._isHorizontal() ?
        (this._getEventLocation(event) - boundingClientRect.left) / boundingClientRect.width :
        (this._getEventLocation(event) - boundingClientRect.top) / boundingClientRect.height
      );
      this.props.onZoom(Math.exp(-event.deltaY * this.props.zoomSpeed), focus);
      event.preventDefault();
    }
    event.stopPropagation();
  };
}
