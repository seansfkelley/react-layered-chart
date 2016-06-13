import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Interval, ScaleFunction, SeriesData} from '../../core';
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

export function wrapDataLayerWithConnect<
    OwnProps,
    OriginalProps extends OwnProps & WrappedDataLayerConnectedProps
  >(OriginalComponent: React.ComponentClass<OriginalProps>): React.ComponentClass<OwnProps & SeriesIdProp> {

  function mapStateToProps(state: ChartState, ownProps: SeriesIdProp): WrappedDataLayerConnectedProps {
    return {
      data: selectData(state)[ownProps.seriesId],
      xDomain: selectXDomain(state),
      yDomain: selectYDomains(state)[ownProps.seriesId]
    };
  }

  return connect(mapStateToProps)(OriginalComponent) as React.ComponentClass<OwnProps & SeriesIdProp>;
}
