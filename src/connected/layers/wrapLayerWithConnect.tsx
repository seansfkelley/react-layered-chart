import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Range, ScaleFunction, SeriesData} from '../../core';
import { SeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectData, selectXDomain, selectYDomains } from '../model/selectors';

export interface SeriesIdProp {
  seriesId: SeriesId;
}

export interface ConnectedProps {
  data: SeriesData;
  xDomain: Range;
  yDomain: Range;
}

export default function<OwnProps, OriginalProps extends OwnProps & ConnectedProps>(OriginalComponent: React.ComponentClass<OriginalProps>): React.ComponentClass<OwnProps & SeriesIdProp> {

  @PureRender
  class ConnectedLayerWrapper extends React.Component<OwnProps & ConnectedProps & SeriesIdProp, void> {
    render() {
      return <OriginalComponent {...this.props}/>
    }
  };

  function mapStateToProps(state: ChartState, ownProps: SeriesIdProp): ConnectedProps {
    return {
      data: selectData(state)[ownProps.seriesId],
      xDomain: selectXDomain(state),
      yDomain: selectYDomains(state)[ownProps.seriesId]
    };
  }

  return connect(mapStateToProps)(ConnectedLayerWrapper) as React.ComponentClass<OwnProps & SeriesIdProp>;
}
