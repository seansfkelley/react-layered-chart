import * as _ from 'lodash';

import { Interval } from '../../core';
import ActionType from '../model/ActionType';
import { ChartState} from '../model/state';
import { SeriesId, TBySeriesId, DataLoader, LoadedSeriesData } from '../interfaces';
import { selectXDomain } from '../model/selectors';
import { setYDomains, setSeriesIds, setDataLoader, dataRequested, dataReturned, dataErrored } from './atomicActions';

function _makeKeyedDataBatcher<T>(onBatch: (batchData: TBySeriesId<T>) => void): (partialData: TBySeriesId<T>) => void {
  let keyedBatchAccumulator: TBySeriesId<T> = {};

  const throttledBatchCallback = _.throttle(() => {
    // Save it off first in case the batch triggers any more additions.
    const batchData = keyedBatchAccumulator;
    keyedBatchAccumulator = {};
    onBatch(batchData);
  }, 500, { leading: false, trailing: true });

  return function(keyedData: TBySeriesId<T>) {
    _.assign(keyedBatchAccumulator, keyedData);
    throttledBatchCallback();
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
      dispatch(setYDomains(payload));
    });

    const batchedDataErrored = _makeKeyedDataBatcher<any>((payload: TBySeriesId<any>) => {
      dispatch(dataErrored(payload));
    });

    function isResultStillRelevant(postLoadChartState: ChartState, seriesId: SeriesId) {
      return preLoadChartState.loadVersionBySeriesId[seriesId] === postLoadChartState.loadVersionBySeriesId[seriesId];
    }

    _.each(loadPromiseBySeriesId, (dataPromise: Promise<LoadedSeriesData>, seriesId: SeriesId) =>
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
  };

  thunk.meta = {
    debounce: {
      time: 1000,
      key: 'data-load'
    }
  };

  return thunk;
}

export function requestDataLoad(seriesIds?: SeriesId[]) {
  return (dispatch, getState) => {
    const existingSeriesIds: SeriesId[] = getState().seriesIds;
    const seriesIdsToLoad = seriesIds
      ? _.intersection(seriesIds, existingSeriesIds)
      : existingSeriesIds;

    dispatch(dataRequested(seriesIdsToLoad));
    dispatch(_performDataLoad());
  };
}

export function setSeriesIds(payload: SeriesId[]) {
  return (dispatch, getState) => {
    const newSeriesIds: SeriesId[] = _.difference(payload, getState().seriesIds);

    dispatch(setSeriesIds(payload));
    dispatch(requestDataLoad(newSeriesIds));
  };
}

export function setDataLoader(payload: DataLoader) {
  return (dispatch, getState) => {
    const state: ChartState = getState();

    if (state.dataLoader !== payload) {
      dispatch(setDataLoader(payload));
      dispatch(requestDataLoad());
    }
  };
}
