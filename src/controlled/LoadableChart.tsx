import * as React from 'react';
import { Interval } from '../core';

import { Chart, ChartState, ChartProps } from './Chart';

interface LoadedSeriesData {
  data: any[];
  yDomain: Interval;
}

interface LoadableChartProps extends ChartProps {
  loadData: (state: ChartState) => Record<string, LoadedSeriesData>;
}

export class Component extends React.PureComponent<LoadableChartProps, void> {
  private onXDomainChange = (xDomain: Interval) => {
    if (this)
  };

  render() {
    return (
      <Chart
        {...this.props}
        onXDomainChange={this.onXDomainChange}
      />
    );
  }
}
