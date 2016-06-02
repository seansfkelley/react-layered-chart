import * as React from 'react';

import { DATA, X_DOMAIN, Y_DOMAIN } from './test-data';
import {
  Range,
  ChartProvider,
  Stack,
  ConnectedSimpleLineLayer,
  ConnectedInteractionCaptureLayer,
  createStaticDataLoader,
  enforceRangeBounds
} from '../src';

const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

const CHART_BOUNDS = {
  min: X_DOMAIN.min - ONE_WEEK_MS,
  max: X_DOMAIN.max + ONE_WEEK_MS
};

const TEST_SERIES_ID = 'foo';

const DATA_LOADER = createStaticDataLoader({
  [TEST_SERIES_ID]: DATA
}, {
  [TEST_SERIES_ID]: Y_DOMAIN
});

// For simplicity in this example, the controlled domain is kept on component
// state, but you should use whatever means is appropriate for your environment.
interface State {
  xDomain: Range;
}

class ControlledInteractiveChart extends React.Component<{}, State> {
  // Declare some sane default.
  state: State = {
    xDomain: X_DOMAIN
  };

  render() {
    return (
      <ChartProvider
        seriesIds={[ TEST_SERIES_ID ]}
        loadData={DATA_LOADER}
        className='example-chart'
        // Control the prop!
        xDomain={this.state.xDomain}
        // Capture any requested changes, such as from a ConnectedInteractionLayer.
        onXDomainChange={this._onXDomainChange.bind(this)}
      >
        <Stack>
          <ConnectedSimpleLineLayer seriesId={TEST_SERIES_ID}/>
          <ConnectedInteractionCaptureLayer enablePan={true}/>
        </Stack>
      </ChartProvider>
    );
  }

  private _onXDomainChange(xDomain: Range) {
    // Use the provided utility to munge the X domain to something acceptable.
    this.setState({
      xDomain: enforceRangeBounds(xDomain, CHART_BOUNDS)
    });
  };
}

const CHART = <ControlledInteractiveChart/>;

export default CHART;
