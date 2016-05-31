import * as _ from 'lodash';

import { Range, TimestampDatum, TimeBucketDatum, SeriesData } from '../../core';
import ActionType, { Action } from '../model/ActionType';
import { ChartState} from '../model/state';
import { SeriesId, TBySeriesId, DataLoader, LoadedSeriesData } from '../interfaces';
import { setYDomain } from './uiActions';
import { selectXDomain, selectYDomains } from '../model/selectors';
import { extendRange } from '../rangeUtils';

function _makeKeyedDataBatcher<T>(onBatch: (batchData: TBySeriesId<T>) => void): (partialData: TBySeriesId<T>) => void {
  let keyedBatchAccumulator: TBySeriesId<T> = {};

  const throttledBatchCallback = _.throttle(() => {
    // Save it off first in case the batch triggers any more additions.
    const batchData = keyedBatchAccumulator;
    keyedBatchAccumulator = {};
    onBatch(batchData);
  }, 500, { leading: false, trailing: true });

  return function(keyedData: TBySeriesId<T>) {
    _.extend(keyedBatchAccumulator, keyedData);
    throttledBatchCallback();
  };
}

function _performDataLoad() {
  const thunk: any = (dispatch, getState: () => ChartState) => {
    const preLoadChartState = getState();
    const dataLoader = preLoadChartState.dataLoader;

    const loadPromiseBySeriesId = dataLoader(
      preLoadChartState.seriesIds,
      selectXDomain(preLoadChartState),
      selectYDomains(preLoadChartState),
      preLoadChartState.physicalChartWidth,
      preLoadChartState.dataBySeriesId
    );

    const batchedDataReturned = _makeKeyedDataBatcher<any>((payload: TBySeriesId<any>) => {
      dispatch({
        type: ActionType.DATA_RETURNED,
        payload
      });
    });

    const batchedSetYDomains = _makeKeyedDataBatcher<Range>((payload: TBySeriesId<Range>) => {
      dispatch(setYDomain(payload));
    });

    const batchedDataErrored = _makeKeyedDataBatcher<any>((payload: TBySeriesId<any>) => {
      dispatch({
        type: ActionType.DATA_ERRORED,
        payload
      });
    });

    _.each(loadPromiseBySeriesId, (dataPromise: Promise<LoadedSeriesData>, seriesId: SeriesId) =>
      dataPromise
      .then(loadedData => {
        const postLoadChartState = getState();
        if (preLoadChartState.loadVersion === postLoadChartState.loadVersion && _.includes(postLoadChartState.seriesIds, seriesId)) {
          batchedDataReturned({
            [seriesId]: loadedData.data
          });

          batchedSetYDomains({
            [seriesId]: loadedData.yDomain
          });
        }
      })
      .catch(error => {
        const postLoadChartState = getState();
        if (preLoadChartState.loadVersion === postLoadChartState.loadVersion && _.includes(postLoadChartState.seriesIds, seriesId)) {
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

export function requestDataLoad() {
  return (dispatch, getState) => {
    dispatch({
      type: ActionType.DATA_REQUESTED,
      payload: _.uniqueId('series-version-id-')
    });

    dispatch(_performDataLoad());
  };
}

export function setSeriesIds(payload: SeriesId[]) {
  return (dispatch, getState) => {
    const state: ChartState = getState();

    if (!_.isEqual(_.sortBy(payload), _.sortBy(state.seriesIds))) {
      dispatch({
        type: ActionType.SET_SERIES_IDS,
        payload
      });

      dispatch(requestDataLoad());
    }
  };
}

export function setDataLoader(payload: DataLoader) {
  return (dispatch, getState) => {
    const state: ChartState = getState();

    if (state.dataLoader !== payload) {
      dispatch({
        type: ActionType.SET_DATA_LOADER,
        payload
      });

      dispatch(requestDataLoad());
    }
  };
}
