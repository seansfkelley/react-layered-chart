import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as classNames from 'classnames';
import { Store } from 'redux';
import { Provider } from 'react-redux';

import { Range, Stack } from '../core';
import storeFactory from './flux/storeFactory';
import { ChartId, SeriesId, TBySeriesId, DataLoader } from './interfaces';
import { DefaultChartState, ChartState } from './model/state';
import { setXDomain, setYDomain, setHover, setSelection } from './flux/uiActions';
import { setMetadata, setSeriesIds, setDataLoader } from './flux/dataActions';
import ResizeSentinelLayer from './layers/ResizeSentinelLayer';

export interface Props {
  chartId?: ChartId;
  seriesIds: SeriesId[];
  seriesMetadata: TBySeriesId<any>;

  defaultState?: DefaultChartState;
  loadData?: DataLoader;
  onLoadStateChange?: (isLoading: TBySeriesId<boolean>) => void;
  onError?: (errors: TBySeriesId<any>) => void;
  includeResizeSentinel?: boolean;
  className?: string;

  // Controlled props go here.
  xDomain?: Range;
  onXDomainChange?: (xDomain: Range) => void;
  yDomains?: TBySeriesId<Range>;
  onYDomainsChange?: (yDomains: TBySeriesId<Range>) => void;
  selection?: Range;
  onSelectionChange?: (selection: Range) => void;
  hover?: number;
  onHoverChange?: (hover: number) => void;
}

@PureRender
export default class ChartProvider extends React.Component<Props, {}> {
  private _store: Store;
  private _lastState: ChartState;
  private _unsubscribeCallback: Function;

  static defaultProps = {
    includeResizeSentinel: true
  } as any;

  componentWillMount() {
    this._store = storeFactory(this.props.chartId);
    this._onStoreChange(this.props);
    this._maybeFireAllCallbacks();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.chartId !== this.props.chartId) {
      this._store = storeFactory(this.props.chartId);
      this._onStoreChange(nextProps);
    } else {
      this._onPropsChange(nextProps);
    }
    this._maybeFireAllCallbacks();
  }

  componentWillUnmount() {
    this._tryUnsubscribe();
  }

  private _onStoreChange(props: Props) {
    this._tryUnsubscribe();
    this._lastState = this._store.getState();
    this._unsubscribeCallback = this._store.subscribe(this._maybeFireAllCallbacks.bind(this));

    this._store.dispatch(setSeriesIds(props.seriesIds));
    this._store.dispatch(setMetadata(props.seriesMetadata));
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
  }

  private _tryUnsubscribe() {
    if (this._unsubscribeCallback) {
      this._unsubscribeCallback();
    }
    this._lastState = null;
  }

  private _maybeFireAllCallbacks() {
    const state: ChartState = this._store.getState();
    this._maybeFireCallback(state.uiState.xDomain,           this._lastState.uiState.xDomain,           this.props.onXDomainChange);
    this._maybeFireCallback(state.uiState.yDomainBySeriesId, this._lastState.uiState.yDomainBySeriesId, this.props.onYDomainsChange);
    this._maybeFireCallback(state.uiState.selection,         this._lastState.uiState.selection,         this.props.onSelectionChange);
    this._maybeFireCallback(state.uiState.hover,             this._lastState.uiState.hover,             this.props.onHoverChange);
    this._maybeFireCallback(state.isLoadingBySeriesId,       this._lastState.isLoadingBySeriesId,       this.props.onLoadStateChange);
    this._maybeFireCallback(state.errorBySeriesId,           this._lastState.errorBySeriesId,           this.props.onError);
    this._lastState = state;
  }

  private _maybeFireCallback<T>(currentState: T, lastState: T, callback?: (value: T) => void) {
    if (callback && currentState !== lastState) {
      callback(currentState);
    }
  }

  private _onPropsChange(nextProps: Props) {
    this._maybeDispatchChangedProp(this.props.seriesIds,      nextProps.seriesIds,      setSeriesIds);
    this._maybeDispatchChangedProp(this.props.seriesMetadata, nextProps.seriesMetadata, setMetadata);
    this._maybeDispatchChangedProp(this.props.loadData,       nextProps.loadData,       setDataLoader);
    this._maybeDispatchChangedProp(this.props.xDomain,        nextProps.xDomain,        setXDomain);
    this._maybeDispatchChangedProp(this.props.yDomains,       nextProps.yDomains,       setYDomain);
    this._maybeDispatchChangedProp(this.props.hover,          nextProps.hover,          setHover);
    this._maybeDispatchChangedProp(this.props.selection,      nextProps.selection,      setSelection);
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
            ? <Stack className='autoinjected-resize-sentinel-stack'><ResizeSentinelLayer/></Stack>
            : null}
          {this.props.children}
        </div>
      </Provider>
    );
  }
}
