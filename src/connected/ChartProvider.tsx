import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as classNames from 'classnames';
import { Store } from 'redux';
import { Provider } from 'react-redux';

import { Interval, Stack, propTypes, PixelRatioContextProvider } from '../core';
import storeFactory from './flux/storeFactory';
import { ChartId, SeriesId, TBySeriesId, DataLoader } from './interfaces';
import { DefaultChartState, ChartState } from './model/state';
import { setXDomain, setYDomain, setHover, setSelection } from './flux/uiActions';
import { setSeriesIds, setDataLoader } from './flux/dataActions';
import ConnectedResizeSentinelLayer from './layers/ConnectedResizeSentinelLayer';

export interface Props {
  seriesIds: SeriesId[];
  loadData: DataLoader;

  className?: string;
  pixelRatio?: number;
  chartId?: ChartId;
  defaultState?: DefaultChartState;
  onLoadStateChange?: (isLoading: TBySeriesId<boolean>) => void;
  onError?: (errors: TBySeriesId<any>) => void;
  includeResizeSentinel?: boolean;

  // Controlled props go here.
  xDomain?: Interval;
  onXDomainChange?: (xDomain: Interval) => void;
  yDomains?: TBySeriesId<Interval>;
  onYDomainsChange?: (yDomains: TBySeriesId<Interval>) => void;
  selection?: Interval;
  onSelectionChange?: (selection: Interval) => void;
  hover?: number;
  onHoverChange?: (hover: number) => void;
}

@PureRender
@PixelRatioContextProvider
export default class ChartProvider extends React.Component<Props, {}> {
  static propTypes = {
    seriesIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    loadData: React.PropTypes.func.isRequired,

    className: React.PropTypes.string,
    pixelRatio: React.PropTypes.number,
    chartId: React.PropTypes.string,
    onLoadStateChange: React.PropTypes.func,
    onError: React.PropTypes.func,
    includeResizeSentinel: React.PropTypes.bool,

    xDomain: propTypes.interval,
    onXDomainChange: React.PropTypes.func,
    yDomains: React.PropTypes.objectOf(propTypes.interval),
    onYDomainsChange: React.PropTypes.func,
    selection: propTypes.interval,
    onSelectionChange: React.PropTypes.func,
    hover: React.PropTypes.number,
    onHoverChange: React.PropTypes.func,
  };

  private _store: Store;
  private _lastState: ChartState;
  private _unsubscribeCallback: Function;

  static defaultProps = {
    includeResizeSentinel: true
  } as any;

  componentWillMount() {
    this._store = storeFactory(this.props.chartId);
    this._onStoreChange(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.chartId !== this.props.chartId) {
      this._tryUnsubscribe();
      this._store = storeFactory(this.props.chartId);
      this._onStoreChange(nextProps);
    } else {
      this._onPropsChange(nextProps);
    }
  }

  componentWillUnmount() {
    this._tryUnsubscribe();
  }

  private _tryUnsubscribe() {
    if (this._unsubscribeCallback) {
      this._unsubscribeCallback();
    }
    this._lastState = null;
  }

  private _onStoreChange(props: Props) {
    this._lastState = this._store.getState();

    this._store.dispatch(setSeriesIds(props.seriesIds));
    this._store.dispatch(setDataLoader(props.loadData));
    // These should perhaps be set on the store as explicit "default" fields rather than auto-dispatched on load.
    if (props.xDomain) {
      this._store.dispatch(setXDomain(props.xDomain, true));
    } else if (props.defaultState && props.defaultState.xDomain) {
      this._store.dispatch(setXDomain(props.defaultState.xDomain));
    }
    if (props.yDomains) {
      this._store.dispatch(setYDomain(props.yDomains, true));
    } else if (props.defaultState && props.defaultState.yDomains) {
      this._store.dispatch(setYDomain(props.defaultState.yDomains));
    }
    if (props.hover) {
      this._store.dispatch(setHover(props.hover, true));
    }
    if (props.selection) {
      this._store.dispatch(setSelection(props.selection, true));
    }

    this._maybeFireAllCallbacks();
    this._unsubscribeCallback = this._store.subscribe(this._maybeFireAllCallbacks.bind(this));
  }

  private _maybeFireAllCallbacks() {
    const state: ChartState = this._store.getState();
    this._maybeFireCallback(state.uiState.xDomain,           this._lastState.uiState.xDomain,           this.props.onXDomainChange);
    this._maybeFireCallback(state.uiState.yDomainBySeriesId, this._lastState.uiState.yDomainBySeriesId, this.props.onYDomainsChange);
    this._maybeFireCallback(state.uiState.selection,         this._lastState.uiState.selection,         this.props.onSelectionChange);
    this._maybeFireCallback(state.uiState.hover,             this._lastState.uiState.hover,             this.props.onHoverChange);

    // TODO: These two should maybe be replaced with delegations to selectors.
    this._maybeFireCallback(state.errorBySeriesId, this._lastState.errorBySeriesId, this.props.onError);
    this._maybeFireCallbackWithConversion(
      state.loadVersionBySeriesId,
      this._lastState.loadVersionBySeriesId,
      (loadVersions) => _.mapValues(loadVersions, v => !!v),
      this.props.onLoadStateChange
    );
    this._lastState = state;
  }

  private _maybeFireCallback<T>(currentState: T, lastState: T, callback?: (value: T) => void) {
    if (callback && currentState !== lastState) {
      callback(currentState);
    }
  }

  private _maybeFireCallbackWithConversion<T, U>(
    currentState: T,
    lastState: T,
    conversion: (value: T) => U,
    callback?: (value: U) => void
  ) {
    if (callback && currentState !== lastState) {
      callback(conversion(currentState));
    }
  }

  private _onPropsChange(nextProps: Props) {
    this._maybeDispatchChangedProp(this.props.seriesIds, nextProps.seriesIds, setSeriesIds);
    this._maybeDispatchChangedProp(this.props.loadData,  nextProps.loadData,  setDataLoader);
    this._maybeDispatchChangedProp(this.props.xDomain,   nextProps.xDomain,   setXDomain);
    this._maybeDispatchChangedProp(this.props.yDomains,  nextProps.yDomains,  setYDomain);
    this._maybeDispatchChangedProp(this.props.hover,     nextProps.hover,     setHover);
    this._maybeDispatchChangedProp(this.props.selection, nextProps.selection, setSelection);
  }

  private _maybeDispatchChangedProp<T>(prop: T, nextProp: T, actionCreator: (payload: T, isOverride?: boolean) => void) {
    if (prop !== nextProp) {
      this._store.dispatch(actionCreator(nextProp, true));
    }
  }

  render() {
    return (
      <Provider store={this._store}>
        <div className={classNames('lc-chart-provider', this.props.className)}>
          {this.props.includeResizeSentinel
            ? <Stack className='autoinjected-resize-sentinel-stack'>
                <ConnectedResizeSentinelLayer/>
              </Stack>
            : null}
          {this.props.children}
        </div>
      </Provider>
    );
  }
}
