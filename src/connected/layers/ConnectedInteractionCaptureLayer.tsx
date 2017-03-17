import * as React from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Interval,
  BooleanMouseEventHandler,
  panInterval,
  zoomInterval,
  InteractionCaptureLayer
} from '../../core';
import { setSelection, setHover } from '../flux/atomicActions';
import { setXDomainAndLoad } from '../flux/compoundActions';
import { ChartState } from '../model/state';
import { selectXDomain } from '../model/selectors';

export interface OwnProps {
  shouldZoom?: BooleanMouseEventHandler;
  shouldPan?: BooleanMouseEventHandler;
  shouldHover?: BooleanMouseEventHandler;
  shouldBrush?: BooleanMouseEventHandler;
  zoomSpeed?: number;
}

export interface ConnectedProps {
  xDomain: Interval;
}

export interface DispatchProps {
  setXDomainAndLoad: typeof setXDomainAndLoad;
  setSelection: typeof setSelection;
  setHover: typeof setHover;
}

export class ConnectedInteractionCaptureLayer extends React.PureComponent<OwnProps & ConnectedProps & DispatchProps, {}> {
  render() {
    return (
      <InteractionCaptureLayer
        xDomain={this.props.xDomain}
        onZoom={!!this.props.shouldZoom ? this._zoom : undefined}
        onPan={!!this.props.shouldPan ? this._pan : undefined}
        onHover={!!this.props.shouldHover ? this._hover : undefined}
        onBrush={!!this.props.shouldBrush ? this._brush : undefined}
        shouldZoom={this.props.shouldZoom}
        shouldPan={this.props.shouldPan}
        shouldHover={this.props.shouldHover}
        shouldBrush={this.props.shouldBrush}
        zoomSpeed={this.props.zoomSpeed}
      />
    );
  }

  private _zoom = (factor: number, anchorBias: number) => {
    this.props.setXDomainAndLoad(zoomInterval(this.props.xDomain, factor, anchorBias));
  };

  private _pan = (logicalUnits: number) => {
    this.props.setXDomainAndLoad(panInterval(this.props.xDomain, logicalUnits));
  };

  private _brush = (logicalUnitInterval?: Interval) => {
    this.props.setSelection(logicalUnitInterval);
  };

  private _hover = (logicalPosition?: number) => {
    this.props.setHover(logicalPosition);
  };
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    xDomain: selectXDomain(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<ChartState>): DispatchProps {
  return bindActionCreators({
    setXDomainAndLoad,
    setSelection,
    setHover
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedInteractionCaptureLayer) as React.ComponentClass<OwnProps>;
