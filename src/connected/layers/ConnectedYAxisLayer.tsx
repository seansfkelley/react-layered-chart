import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import { Interval, Color, AxisSpec, YAxisLayer as UnconnectedYAxisLayer, YAxisControls} from '../../core';
import { SeriesId, TBySeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectYDomains } from '../model/selectors';
import { setOverrideYDomains } from '../flux/atomicActions';
import { zoomInterval, panInterval } from '../../../lib/core/intervalUtils';

export interface ConnectedYAxisSpec extends AxisSpec {
  seriesId: SeriesId;
}

export interface OwnProps extends YAxisControls {
  axes: ConnectedYAxisSpec[];
  font?: string;
  backgroundColor?: Color;
  enablePan?: boolean;
  enableZoom?: boolean;
}

export interface ConnectedProps {
  yDomainsBySeriesId: TBySeriesId<Interval>;
}

export interface DispatchProps {
  setOverrideYDomains: typeof setOverrideYDomains;
}

@PureRender
export class ConnectedYAxisLayer extends React.Component<OwnProps & ConnectedProps & DispatchProps, {}> {
  render() {
    const denormalizedProps = _.defaults({
      axes: this.props.axes.map(axis => _.defaults({
        yDomain: this.props.yDomainsBySeriesId[axis.seriesId],
        axisId: axis.seriesId
      }, axis)),
      shouldPan: this.props.shouldPan ? this.props.shouldPan : () => this.props.enablePan || this.props.onPan,
      shouldZoom: this.props.shouldZoom ? this.props.shouldZoom : () => this.props.enableZoom || this.props.onZoom,
      onZoom: this._onZoom,
      onPan: this._onPan
    }, this.props);
    return (
      <UnconnectedYAxisLayer {...denormalizedProps}/>
    );
  }

  private _onZoom = (factor: number, anchorBias: number, axisId: number | string) => {
    const yDomainsBySeriesId = _.clone(this.props.yDomainsBySeriesId);
    yDomainsBySeriesId[axisId] = zoomInterval(yDomainsBySeriesId[axisId], factor, anchorBias);
    this.props.setOverrideYDomains(yDomainsBySeriesId);
    if (this.props.onZoom) {
      this.props.onZoom(factor, anchorBias, axisId);
    }
  };
  private _onPan = (logicalUnits: number, axisId: number | string) => {
    const yDomainsBySeriesId = _.clone(this.props.yDomainsBySeriesId);
    yDomainsBySeriesId[axisId] = panInterval(yDomainsBySeriesId[axisId], logicalUnits);
    this.props.setOverrideYDomains(yDomainsBySeriesId);
    if (this.props.onPan) {
      this.props.onPan(logicalUnits, axisId);
    }
  };
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    yDomainsBySeriesId: selectYDomains(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators({
    setOverrideYDomains
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedYAxisLayer) as React.ComponentClass<OwnProps>;
