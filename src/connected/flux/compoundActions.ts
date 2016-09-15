import * as _ from 'lodash';

import { Interval } from '../../core';
import { ChartState} from '../model/state';
import { SeriesId, TBySeriesId, DataLoader, LoadedSeriesData } from '../interfaces';
import { selectXDomain, selectData, selectLoadedYDomains } from '../model/selectors';

import {
  setXDomain,
  setOverrideXDomain,
  setYDomains,
  setChartPhysicalWidth,
  setSeriesIds,
  setDataLoader,
  dataRequested,
  dataReturned,
  dataErrored
} from './atomicActions';

export function setXDomainAndLoad(payload: Interval) {
  return (dispatch, getState) => {
    const state: ChartState = getState();

    if (!_.isEqual(payload, state.uiState.xDomain)) {
      dispatch(setXDomain(payload));
      if (!state.uiStateConsumerOverrides.xDomain) {
        dispatch(_requestDataLoad());
      }
    }
  };
}

export function setOverrideXDomainAndLoad(payload: Interval) {
  return (dispatch, getState) => {
    const state: ChartState = getState();

    if (!_.isEqual(payload, state.uiStateConsumerOverrides.xDomain)) {
      dispatch(setOverrideXDomain(payload));
      dispatch(_requestDataLoad());
    }
  };
}

export function setChartPhysicalWidthAndLoad(payload: number) {
  return (dispatch, getState) => {
    const state: ChartState = getState();

    if (payload !== state.physicalChartWidth) {
      dispatch(setChartPhysicalWidth(payload));
      dispatch(_requestDataLoad());
    }
  };
}

export function setSeriesIdsAndLoad(payload: SeriesId[]) {
  return (dispatch, getState) => {
    const state: ChartState = getState();

    if (!_.isEqual(payload, state.seriesIds)) {
      const newSeriesIds: SeriesId[] = _.difference(payload, state.seriesIds);
      dispatch(setSeriesIds(payload));
      dispatch(_requestDataLoad(newSeriesIds));
    }
  };
}

export function setDataLoaderAndLoad(payload: DataLoader) {
  return (dispatch, getState) => {
    const state: ChartState = getState();

    if (state.dataLoader !== payload) {
      dispatch(setDataLoader(payload));
      dispatch(_requestDataLoad());
    }
  };
}

// Exported for testing.
export function _requestDataLoad(seriesIds?: SeriesId[]) {
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
export function _performDataLoad(batchingTimeout: number = 200) {
  return (dispatch, getState: () => ChartState) => {
    const adjustedTimeout = Math.min(batchingTimeout, getState().debounceTimeout);

    const thunk: any = (dispatch, getState: () => ChartState) => {
      const preLoadChartState = getState();
      const dataLoader = preLoadChartState.dataLoader;

      const seriesIdsToLoad = _.keys(_.pickBy(preLoadChartState.loadVersionBySeriesId));

      const loadPromiseBySeriesId = dataLoader(
        seriesIdsToLoad,
        selectXDomain(preLoadChartState),
        selectLoadedYDomains(preLoadChartState),
        preLoadChartState.physicalChartWidth,
        selectData(preLoadChartState),
        preLoadChartState.loadedDataBySeriesId
      );

      const batchedDataReturned = _makeKeyedDataBatcher<any>((payload: TBySeriesId<any>) => {
        dispatch(dataReturned(payload));
      }, adjustedTimeout);

      const batchedDataErrored = _makeKeyedDataBatcher<any>((payload: TBySeriesId<any>) => {
        dispatch(dataErrored(payload));
      }, adjustedTimeout);

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
        time: getState().debounceTimeout,
        key: 'data-load'
      }
    };

    return dispatch(thunk);
  };
}
