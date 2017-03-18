import * as _ from 'lodash';
import { ThunkAction } from 'redux-thunk';

import { Interval } from '../../core';
import { ChartState } from '../model/state';
import { SeriesId, TBySeriesId, DataLoader, LoadedSeriesData } from '../interfaces';
import { selectXDomain } from '../model/selectors';

import {
  setXDomain,
  setOverrideXDomain,
  setChartPhysicalWidth,
  setSeriesIds,
  setDataLoader,
  setDataLoaderContext,
  dataRequested,
  dataReturned,
  dataErrored
} from './atomicActions';

export function setXDomainAndLoad(payload: Interval): ThunkAction<void, ChartState, void> {
  return (dispatch, getState) => {
    const state = getState();

    if (!_.isEqual(payload, state.uiState.xDomain)) {
      dispatch(setXDomain(payload));
      if (!state.uiStateConsumerOverrides.xDomain) {
        dispatch(_requestDataLoad());
      }
    }
  };
}

export function setOverrideXDomainAndLoad(payload?: Interval): ThunkAction<void, ChartState, void> {
  return (dispatch, getState) => {
    const state = getState();

    if (!_.isEqual(payload, state.uiStateConsumerOverrides.xDomain)) {
      dispatch(setOverrideXDomain(payload));
      dispatch(_requestDataLoad());
    }
  };
}

export function setChartPhysicalWidthAndLoad(payload: number): ThunkAction<void, ChartState, void> {
  return (dispatch, getState) => {
    const state = getState();

    if (payload !== state.physicalChartWidth) {
      dispatch(setChartPhysicalWidth(payload));
      dispatch(_requestDataLoad());
    }
  };
}

export function setSeriesIdsAndLoad(payload: SeriesId[]): ThunkAction<void, ChartState, void> {
  return (dispatch, getState) => {
    const state = getState();
    const orderedSeriesIds = _.sortBy(payload);

    if (!_.isEqual(orderedSeriesIds, state.seriesIds)) {
      const newSeriesIds: SeriesId[] = _.difference(orderedSeriesIds, state.seriesIds);
      dispatch(setSeriesIds(orderedSeriesIds));
      dispatch(_requestDataLoad(newSeriesIds));
    }
  };
}

export function setDataLoaderAndLoad(payload: DataLoader): ThunkAction<void, ChartState, void> {
  return (dispatch, getState) => {
    const state = getState();

    if (state.dataLoader !== payload) {
      dispatch(setDataLoader(payload));
      dispatch(_requestDataLoad());
    }
  };
}

export function setDataLoaderContextAndLoad(payload?: any): ThunkAction<void, ChartState, void> {
  return (dispatch, getState) => {
    const state = getState();

    if (payload !== state.loaderContext) {
      dispatch(setDataLoaderContext(payload));
      dispatch(_requestDataLoad());
    }
  };
}

// Exported for testing.
export function _requestDataLoad(seriesIds?: SeriesId[]): ThunkAction<void, ChartState, void> {
  return (dispatch, getState) => {
    const existingSeriesIds: SeriesId[] = getState().seriesIds;
    const seriesIdsToLoad = seriesIds
      ? _.intersection(seriesIds, existingSeriesIds)
      : existingSeriesIds;

    dispatch(dataRequested(seriesIdsToLoad));
    dispatch(_performDataLoad());
  };
}

// Exported for testing.
export function _makeKeyedDataBatcher<T>(onBatch: (batchData: TBySeriesId<T>) => void, timeout: number): (partialData: TBySeriesId<T>) => void {
  let keyedBatchAccumulator: TBySeriesId<T> = {};

  const throttledBatchCallback = _.throttle(() => {
    // Save it off first in case the batch triggers any more additions.
    const batchData = keyedBatchAccumulator;
    keyedBatchAccumulator = {};
    onBatch(batchData);
  }, timeout, { leading: false, trailing: true });

  return function(keyedData: TBySeriesId<T>) {
    _.assign(keyedBatchAccumulator, keyedData);
    throttledBatchCallback();
  };
}

// Exported for testing.
export function _performDataLoad(batchingTimeout: number = 200): ThunkAction<Promise<any>, ChartState, void> & { meta?: any } {
  return (dispatch, getState) => {
    let { debounceTimeout } = getState();

    // redux-debounced checks falsy-ness, so 0 will behave as if there is no debouncing!
    debounceTimeout = debounceTimeout === 0 ? 1 : debounceTimeout;

    const adjustedBatchingTimeout = Math.min(batchingTimeout, debounceTimeout);

    const thunk: ThunkAction<Promise<any>, ChartState, void> & { meta?: any } = (dispatch, getState) => {
      const preLoadChartState = getState();
      const dataLoader = preLoadChartState.dataLoader;
      const loaderContext = preLoadChartState.loaderContext;

      const seriesIdsToLoad = _.keys(_.pickBy(preLoadChartState.loadVersionBySeriesId));

      const loadPromiseBySeriesId = dataLoader(
        seriesIdsToLoad,
        selectXDomain(preLoadChartState),
        preLoadChartState.physicalChartWidth,
        preLoadChartState.loadedDataBySeriesId,
        loaderContext
      );

      const batchedDataReturned = _makeKeyedDataBatcher<any>((payload: TBySeriesId<any>) => {
        dispatch(dataReturned(payload));
      }, adjustedBatchingTimeout);

      const batchedDataErrored = _makeKeyedDataBatcher<any>((payload: TBySeriesId<any>) => {
        dispatch(dataErrored(payload));
      }, adjustedBatchingTimeout);

      function isResultStillRelevant(postLoadChartState: ChartState, seriesId: SeriesId) {
        return preLoadChartState.loadVersionBySeriesId[ seriesId ] === postLoadChartState.loadVersionBySeriesId[ seriesId ];
      }

      const dataPromises = _.map(loadPromiseBySeriesId, (dataPromise: Promise<LoadedSeriesData>, seriesId: SeriesId) =>
        dataPromise
          .then(loadedData => {
            if (isResultStillRelevant(getState(), seriesId)) {
              batchedDataReturned({
                [seriesId]: loadedData
              });
            }
          })
          .catch(error => {
            if (isResultStillRelevant(getState(), seriesId)) {
              batchedDataErrored({
                [seriesId]: error
              });
            }
          })
      );

      return Promise.all(dataPromises);
    };

    thunk.meta = {
      debounce: {
        time: debounceTimeout,
        key: 'data-load'
      }
    };

    return dispatch(thunk);
  };
}
