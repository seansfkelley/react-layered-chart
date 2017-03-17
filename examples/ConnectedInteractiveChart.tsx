/*
This example implements a chart with both a custom view and some custom behavior.
A button is added underneath the chart that displays the current X domain, and
if you click it, it will reset the domain to where it started.
*/

import * as React from "react";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import {
  ChartProvider,
  ChartProviderState,
  ConnectedInteractionCaptureLayer,
  ConnectedLineLayer,
  DataLoader,
  Interval,
  Stack,
  selectXDomain,
  setXDomain,
  DEFAULT_SHOULD_PAN,
  DEFAULT_SHOULD_ZOOM
} from "../src";
import { SIMPLE_LINE_DATA, SIMPLE_LINE_X_DOMAIN, SIMPLE_LINE_Y_DOMAIN } from "./test-data";

// All series need to have an ID.
const SERIES_ID = 'foo';

// Set up a test data loader that will just return this static data.
const SIMPLE_LINE_DATA_LOADER: DataLoader = () => ({
  [SERIES_ID]: new Promise(resolve => {
    resolve({
      data: SIMPLE_LINE_DATA,
      yDomain: SIMPLE_LINE_Y_DOMAIN
    });
  })
});

// Props we expect to receive from our our parent component.
interface OwnProps {
  resetXDomain: Interval;
}

// Props auto-injected from the internally managed state.
interface ConnectedProps {
  currentXDomain: Interval;
}

// Actions we want to be able to fire.
interface DispatchProps {
  setXDomain: typeof setXDomain;
}

class SnapToXDomainButton extends React.Component<OwnProps & ConnectedProps & DispatchProps, void> {
  render() {
    // Implement a simple text-based <div> that reacts to clicks.
    return (
      <div className='snap-to-x-domain-button' onClick={() => this.props.setXDomain(this.props.resetXDomain)}>
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
function mapDispatchToProps(dispatch: Dispatch<ChartProviderState>): DispatchProps {
  return bindActionCreators({ setXDomain }, dispatch);
}

// In Typescript, this cast is sometimes necessary.
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/8787
const ConnectedSnapToXDomainButton = connect(mapStateToProps, mapDispatchToProps)(SnapToXDomainButton) as React.ComponentClass<OwnProps>;

// Wrap the button into a chart for demo purposes.
const CHART = (
  // See BasicInteractiveChart.tsx for comments on things that are not commented here.
  <ChartProvider
    seriesIds={[ SERIES_ID ]}
    loadData={SIMPLE_LINE_DATA_LOADER}
    defaultState={{
      xDomain: SIMPLE_LINE_X_DOMAIN
    }}
    className='example-chart'
    loadDataDebounceTimeout={0}
    pixelRatio={window.devicePixelRatio || 1}
  >
    <Stack>
      <ConnectedLineLayer seriesId={SERIES_ID}/>
      <ConnectedInteractionCaptureLayer shouldPan={DEFAULT_SHOULD_PAN} shouldZoom={DEFAULT_SHOULD_ZOOM}/>
    </Stack>
    {/* Give the layer its own Stack so it appears visually separate from the main views. */}
    <Stack className='snap-to-x-domain-button-stack'>
      <ConnectedSnapToXDomainButton resetXDomain={SIMPLE_LINE_X_DOMAIN}/>
    </Stack>
  </ChartProvider>
);

export default CHART;
