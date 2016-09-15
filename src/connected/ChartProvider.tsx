import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as classNames from 'classnames';
import { Store } from 'redux';
import { Provider } from 'react-redux';

import { Interval, Stack, propTypes, PixelRatioContextProvider } from '../core';
import storeFactory from './flux/storeFactory';
import { ChartId, SeriesId, TBySeriesId, DataLoader } from './interfaces';
import { DefaultChartState, ChartState } from './model/state';
import ConnectedResizeSentinelLayer from './layers/ConnectedResizeSentinelLayer';
import {
  setYDomains,
  setOverrideYDomains,
  setOverrideSelection,
  setOverrideHover,
  setDataLoaderDebounceTimeout
} from './flux/atomicActions';
import {
  setXDomainAndLoad,
  setOverrideXDomainAndLoad,
  setSeriesIdsAndLoad,
  setDataLoaderAndLoad
} from './flux/compoundActions';

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
  loadDataDebounceTimeout?: number;

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
  } as React.ValidationMap<Props>;

  private _store: Store;
  private _lastState: ChartState;
  private _unsubscribeCallback: Function;

  static defaultProps = {
    includeResizeSentinel: true
  } as any as Props;

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

    this._store.dispatch(setSeriesIdsAndLoad(props.seriesIds));
    this._store.dispatch(setDataLoaderAndLoad(props.loadData));
    if (this.props.loadDataDebounceTimeout) {
      this._store.dispatch(setDataLoaderDebounceTimeout(props.loadDataDebounceTimeout));
    }
    // These should perhaps be set on the store as explicit "default" fields rather than auto-dispatched on load.
    if (props.xDomain) {
      this._store.dispatch(setOverrideXDomainAndLoad(props.xDomain));
    } else if (props.defaultState && props.defaultState.xDomain) {
      this._store.dispatch(setXDomainAndLoad(props.defaultState.xDomain));
    }
    if (props.yDomains) {
      this._store.dispatch(setOverrideYDomains(props.yDomains));
    } else if (props.defaultState && props.defaultState.yDomains) {
      this._store.dispatch(setYDomains(props.defaultState.yDomains));
    }
    if (props.hover) {
      this._store.dispatch(setOverrideHover(props.hover));
    }
    if (props.selection) {
      this._store.dispatch(setOverrideSelection(props.selection));
    }

    this._maybeFireAllCallbacks();
    this._unsubscribeCallback = this._store.subscribe(this._maybeFireAllCallbacks.bind(this));
  }

  private _maybeFireAllCallbacks() {
    const state: ChartState = this._store.getState();
    this._maybeFireCallback(state.uiState.xDomain,   this._lastState.uiState.xDomain,   this.props.onXDomainChange);
    this._maybeFireCallback(state.uiState.selection, this._lastState.uiState.selection, this.props.onSelectionChange);
    this._maybeFireCallback(state.uiState.hover,     this._lastState.uiState.hover,     this.props.onHoverChange);
    this._maybeFireCallback(state.errorBySeriesId,   this._lastState.errorBySeriesId,   this.props.onError);

    if (this.props.onLoadStateChange) {
      if (state.loadVersionBySeriesId !== this._lastState.loadVersionBySeriesId) {
        this.props.onLoadStateChange(_.mapValues(state.loadVersionBySeriesId, v => !!v));
      }
    }

    if (this.props.onYDomainsChange) {
      if (state.uiState.yDomainBySeriesId !== this._lastState.uiState.yDomainBySeriesId || state.loadedDataBySeriesId !== this._lastState.loadedDataBySeriesId) {
        const internalYDomains = _.assign({}, state.uiState.yDomainBySeriesId, _.mapValues(state.loadedDataBySeriesId, loadedData => loadedData.yDomain));
        this.props.onYDomainsChange(internalYDomains);
      }
    }


    this._lastState = state;
  }

  private _maybeFireCallback<T>(currentState: T, lastState: T, callback?: (value: T) => void) {
    if (callback && currentState !== lastState) {
      callback(currentState);
    }
  }

  private _onPropsChange(nextProps: Props) {
    this._maybeDispatchChangedProp(this.props.seriesIds, nextProps.seriesIds, setSeriesIdsAndLoad);
    this._maybeDispatchChangedProp(this.props.loadData,  nextProps.loadData,  setDataLoaderAndLoad);
    this._maybeDispatchChangedProp(this.props.loadDataDebounceTimeout, nextProps.loadDataDebounceTimeout, setDataLoaderDebounceTimeout);
    this._maybeDispatchChangedProp(this.props.xDomain,   nextProps.xDomain,   setOverrideXDomainAndLoad);
    this._maybeDispatchChangedProp(this.props.yDomains,  nextProps.yDomains,  setOverrideYDomains);
    this._maybeDispatchChangedProp(this.props.hover,     nextProps.hover,     setOverrideHover);
    this._maybeDispatchChangedProp(this.props.selection, nextProps.selection, setOverrideSelection);
  }

  private _maybeDispatchChangedProp<T>(prop: T, nextProp: T, actionCreator: (payload: T) => void) {
    if (prop !== nextProp) {
      this._store.dispatch(actionCreator(nextProp));
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
