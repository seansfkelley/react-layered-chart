import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Range,
  BooleanMouseEventHandler,
  resolvePan,
  resolveZoom,
  InteractionCaptureLayer,
  HoverLayer,
  BrushLayer
} from '../../core';
import * as uiActions from '../flux/uiActions';
import { ChartState } from '../model/state';
import { selectXDomain, selectHover, selectSelection } from '../model/selectors';

export interface OwnProps {
  enablePan?: boolean;
  enableZoom?: boolean;
  enableHover?: boolean;
  enableBrush?: boolean;
  shouldZoom?: BooleanMouseEventHandler;
  shouldPan?: BooleanMouseEventHandler;
  shouldBrush?: BooleanMouseEventHandler;
  zoomSpeed?: number;
}

export interface ConnectedProps {
  xDomain: Range;
  hover?: number;
  selection?: Range;
}

export interface DispatchProps {
  actions: typeof uiActions;
}

@PureRender
export class ConnectedInteractionLayer extends React.Component<OwnProps & ConnectedProps & DispatchProps, {}> {
  render() {
    return (
      <div>
        <InteractionCaptureLayer
          xDomain={this.props.xDomain}
          onZoom={this.props.enableZoom && this._zoom}
          onPan={this.props.enablePan && this._pan}
          onHover={this.props.enableHover && this._hover}
          onBrush={this.props.enableBrush && this._brush}
          shouldZoom={this.props.shouldZoom}
          shouldPan={this.props.shouldPan}
          shouldBrush={this.props.shouldBrush}
          zoomSpeed={this.props.zoomSpeed}
        />
        {this.props.enableHover
          ? <HoverLayer hover={this.props.hover} xDomain={this.props.xDomain}/>
          : null}
        {this.props.enableBrush
          ? <BrushLayer selection={this.props.selection} xDomain={this.props.xDomain}/>
          : null}
      </div>
    );
  }


  private _zoom = (factor: number, anchorBias: number) => {
    this.props.actions.setXDomain(resolveZoom(this.props.xDomain, factor, anchorBias));
  };

  private _pan = (logicalUnits: number) => {
    this.props.actions.setXDomain(resolvePan(this.props.xDomain, logicalUnits));
  };

  private _brush = (logicalUnitRange?: Range) => {
    this.props.actions.setSelection(logicalUnitRange);
  };

  private _hover = (logicalPosition?: number) => {
    this.props.actions.setHover(logicalPosition);
  };
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    xDomain: selectXDomain(state),
    hover: selectHover(state),
    selection: selectSelection(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    actions: bindActionCreators(uiActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedInteractionLayer) as React.ComponentClass<OwnProps>;
