import * as React from 'react';
import { connect } from 'react-redux';

import { Interval, SeriesData} from '../../core';
import { SeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectData, selectXDomain, selectYDomains } from '../model/selectors';

export interface SeriesIdProp {
  seriesId: SeriesId;
}

export interface WrappedDataLayerConnectedProps {
  data: SeriesData;
  xDomain: Interval;
  yDomain: Interval;
}

function mapStateToProps(state: ChartState, ownProps: SeriesIdProp): WrappedDataLayerConnectedProps {
  if (state.seriesIds.indexOf(ownProps.seriesId) === -1) {
    throw new Error(`Cannot render data for missing series ID ${ownProps.seriesId}`);
  }

  return {
    data: selectData(state)[ownProps.seriesId],
    xDomain: selectXDomain(state),
    yDomain: selectYDomains(state)[ownProps.seriesId]
  };
}

export function wrapDataLayerWithConnect<
    OwnProps,
    OriginalProps extends OwnProps & WrappedDataLayerConnectedProps
  >(OriginalComponent: React.ComponentClass<OriginalProps>): React.ComponentClass<OwnProps & SeriesIdProp> {

  return connect(mapStateToProps)(OriginalComponent) as React.ComponentClass<OwnProps & SeriesIdProp>;
}
