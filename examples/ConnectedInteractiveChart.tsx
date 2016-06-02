/*
This example implements a chart with both a custom view and some custom behavior.
A button is added underneat the chart that displays the current X domain, and
if you click it, it will reset the domain to where it started.
*/

import * as React from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { DATA, X_DOMAIN, Y_DOMAIN } from './test-data';
import {
  Range,
  Stack,
  ChartProvider,
  ConnectedSimpleLineLayer,
  ConnectedInteractionCaptureLayer,
  createStaticDataLoader,
  // This type is opaque and should only be interacted with using builtin selectors and action creators.
  ChartProviderState,
  // This is one such selector.
  selectXDomain,
  // This is one such action creator.
  setXDomain,
} from '../src';

// All series need to have an ID.
const TEST_SERIES_ID = 'foo';

// Set up a test data loader that will just return this static data.
const DATA_LOADER = createStaticDataLoader({
  [TEST_SERIES_ID]: DATA
}, {
  [TEST_SERIES_ID]: Y_DOMAIN
});

// Props we expect to receive from our our parent component.
interface OwnProps {
  resetXDomain: Range;
}

// Props auto-injected from the internally managed state.
interface ConnectedProps {
  currentXDomain: Range;
}

// Actions we want to be able to fire.
interface DispatchProps {
  setXDomain: typeof setXDomain;
}

class SnapToXDomainButton extends React.Component<OwnProps & ConnectedProps & DispatchProps, void> {
  render() {
    // Implement a simple text-based <div> that reacts to clicks.
    return (
      <div className='lc-layer snap-to-x-domain-button' onClick={() => this.props.setXDomain(this.props.resetXDomain)}>
        Current: {this.props.currentXDomain.min} to {this.props.currentXDomain.max}. Click me to reset!
      </div>
    );
  }
}

// See react-redux docs for more.
function mapStateToProps(state: ChartProviderState): ConnectedProps {
  return {
    currentXDomain: selectXDomain(state)
  };
}

// See react-redux docs for more.
function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators({ setXDomain }, dispatch);
}

// In Typescript, this cast is sometimes necessary.
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/8787
const ConnectedSnapToXDomainButton = connect(mapStateToProps, mapDispatchToProps)(SnapToXDomainButton) as React.ComponentClass<OwnProps>;

// Wrap the button into a chart for demo purposes.
const CHART = (
  // See BasicInteractiveChart.tsx for comments on things that are not commented here.
  <ChartProvider
    seriesIds={[ TEST_SERIES_ID ]}
    loadData={DATA_LOADER}
    defaultState={{
      xDomain: X_DOMAIN
    }}
    className='example-chart'
  >
    <Stack>
      <ConnectedSimpleLineLayer seriesId={TEST_SERIES_ID}/>
      <ConnectedInteractionCaptureLayer enablePan={true} enableZoom={true}/>
    </Stack>
    {/* Give the layer its own Stack so it appears visually separate from the main views. */}
    <Stack className='snap-to-x-domain-button-stack'>
      <ConnectedSnapToXDomainButton resetXDomain={X_DOMAIN}/>
    </Stack>
  </ChartProvider>
);

export default CHART;
