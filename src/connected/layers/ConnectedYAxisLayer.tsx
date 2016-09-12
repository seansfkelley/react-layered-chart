import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Interval, Color, AxisSpec, YAxisLayer as UnconnectedYAxisLayer} from '../../core';
import { SeriesId, TBySeriesId } from '../interfaces';
import { ChartState } from '../model/state';
import { selectYDomains } from '../model/selectors';

export interface ConnectedYAxisSpec extends AxisSpec {
  seriesId: SeriesId;
}

export interface OwnProps {
  axes: ConnectedYAxisSpec[];
  font?: string;
  backgroundColor?: Color;
}

export interface ConnectedProps {
  yDomainsBySeriesId: TBySeriesId<Interval>;
}

@PureRender
export class ConnectedYAxisLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    const denormalizedProps = _.defaults({
      axes: this.props.axes.map(axis => _.defaults({
        yDomain: this.props.yDomainsBySeriesId[axis.seriesId],
        axisId: axis.seriesId
      }, axis))
    }, this.props);
    return (
      <UnconnectedYAxisLayer {...denormalizedProps}/>
    );
  }
}

function mapStateToProps(state: ChartState): ConnectedProps {
  return {
    yDomainsBySeriesId: selectYDomains(state)
  };
}

export default connect(mapStateToProps)(ConnectedYAxisLayer) as React.ComponentClass<OwnProps>;
