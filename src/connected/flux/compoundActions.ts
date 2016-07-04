import * as _ from 'lodash';

import { Interval } from '../../core';
import { ChartState} from '../model/state';
import { SeriesId, TBySeriesId, DataLoader, LoadedSeriesData } from '../interfaces';
import { selectXDomain } from '../model/selectors';

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

export function setXDomainAndLoad(payload: Interval, isOverride: boolean = false) {
  return (dispatch, getState) => {
    dispatch(setXDomain(payload));
    if (!getState().uiStateConsumerOverrides.xDomain) {
      dispatch(_requestDataLoad());
    }
  };
}

export function setOverrideXDomainAndLoad(payload: Interval) {
  return (dispatch, getState) => {
    dispatch(setOverrideXDomain(payload));
    dispatch(_requestDataLoad());
  };
}

export function setChartPhysicalWidthAndLoad(payload: number) {
  return (dispatch, getState) => {
    dispatch(setChartPhysicalWidth(payload));
    dispatch(_requestDataLoad());
  };
}

export function setSeriesIdsAndLoad(payload: SeriesId[]) {
  return (dispatch, getState) => {
    const newSeriesIds: SeriesId[] = _.difference(payload, getState().seriesIds);

    dispatch(setSeriesIds(payload));
    dispatch(_requestDataLoad(newSeriesIds));
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
export const _BATCH_DURATION = 500;
export function _makeKeyedDataBatcher<T>(onBatch: (batchData: TBySeriesId<T>) => void): (partialData: TBySeriesId<T>) => void {
  let keyedBatchAccumulator: TBySeriesId<T> = {};

  const throttledBatchCallback = _.throttle(() => {
    // Save it off first in case the batch triggers any more additions.
    const batchData = keyedBatchAccumulator;
    keyedBatchAccumulator = {};
    onBatch(batchData);
  }, _BATCH_DURATION, { leading: false, trailing: true });

  return function(keyedData: TBySeriesId<T>) {
    _.assign(keyedBatchAccumulator, keyedData);
    throttledBatchCallback();
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
export function _performDataLoad() {
  const thunk: any = (dispatch, getState: () => ChartState) => {
    const preLoadChartState = getState();
    const dataLoader = preLoadChartState.dataLoader;

    const seriesIdsToLoad = _.keys(_.pickBy(preLoadChartState.loadVersionBySeriesId));

    const loadPromiseBySeriesId = dataLoader(
      seriesIdsToLoad,
      selectXDomain(preLoadChartState),
      preLoadChartState.uiState.yDomainBySeriesId,
      preLoadChartState.physicalChartWidth,
      preLoadChartState.dataBySeriesId
    );

    const batchedDataReturned = _makeKeyedDataBatcher<any>((payload: TBySeriesId<any>) => {
      dispatch(dataReturned(payload));
    });

    const batchedSetYDomains = _makeKeyedDataBatcher<Interval>((payload: TBySeriesId<Interval>) => {
      const state = getState();
      dispatch(setYDomains(_.assign({}, state.uiState.yDomainBySeriesId, payload)));
    });

    const batchedDataErrored = _makeKeyedDataBatcher<any>((payload: TBySeriesId<any>) => {
      dispatch(dataErrored(payload));
    });

    function isResultStillRelevant(postLoadChartState: ChartState, seriesId: SeriesId) {
      return preLoadChartState.loadVersionBySeriesId[seriesId] === postLoadChartState.loadVersionBySeriesId[seriesId];
    }

    const dataPromises = _.map(loadPromiseBySeriesId, (dataPromise: Promise<LoadedSeriesData>, seriesId: SeriesId) =>
      dataPromise
      .then(loadedData => {
        if (isResultStillRelevant(getState(), seriesId)) {
          batchedDataReturned({
            [seriesId]: loadedData.data
          });

          batchedSetYDomains({
            [seriesId]: loadedData.yDomain
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
      time: 1000,
      key: 'data-load'
    }
  };

  return thunk;
}
