import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import {
  TBySeriesId,
  SeriesData,
  Range,
  SeriesId,
  ChartProviderState,
  Stack,
  SimpleLineLayer,
  selectData,
  selectXDomain,
  selectYDomains
} from '../src';

interface OwnProps {
  seriesIds: SeriesId[];
}

export interface ConnectedProps {
  data: TBySeriesId<SeriesData>;
  xDomain: Range;
  yDomainsBySeriesId: TBySeriesId<Range>;
}

@PureRender
class StackedSeriesLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <Stack>
        {this.props.seriesIds.map(seriesId => (
          <SimpleLineLayer
            key={seriesId}
            data={this.props.data[seriesId]}
            xDomain={this.props.xDomain}
            yDomain={this.props.yDomainsBySeriesId[seriesId]}
          />
        ))}
      </Stack>
    );
  }
}

function mapStateToProps(state: ChartProviderState): ConnectedProps {
  return {
    data: selectData(state),
    xDomain: selectXDomain(state),
    yDomainsBySeriesId: selectYDomains(state)
  };
}

export default connect(mapStateToProps)(StackedSeriesLayer) as React.ComponentClass<OwnProps>;
