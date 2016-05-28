import * as _ from 'lodash';

import { Range, TimestampDatum, TimeBucketDatum } from '../../interfaces';
import ActionType, { Action } from '../model/ActionType';
import { ChartState} from '../model/state';
import { SeriesId, TBySeriesId, DataLoader, SeriesData } from '../interfaces';
import { setYDomain } from './uiActions';
import { selectXDomain } from '../model/selectors';
import { extendRange } from '../rangeUtils';

// function _computeYDomain(seriesId: SeriesId, data: SeriesData, layerType: LayerType, currentYDomain: Range): Range {
//   if (data.length === 0) {
//     return currentYDomain;
//   }
//
//   let min;
//   let max;
//   switch (layerType) {
//     case LayerType.LINE:
//       const bucketData = <TimeBucketDatum[]> data;
//       min = _.minBy(bucketData, 'minValue').minValue;
//       max = _.maxBy(bucketData, 'maxValue').maxValue;
//       break;
//
//     case LayerType.POINT:
//       const pointData = <TimestampDatum[]> data;
//       min = _.minBy(pointData, 'value').value;
//       max = _.maxBy(pointData, 'value').value;
//       break;
//
//     default:
//       console.error(`Cannot set Y domain for series ${seriesId} because it didn't specify a known LayerType: ${layerType}.`);
//       return;
//   }
//
//   if (min === max) {
//     min--;
//     max++;
//   }
//
//   return extendRange({ min, max }, 0.1);
// }

function _computeYDomain(seriesId: SeriesId, data: SeriesData, metadata: any, currentYDomain: Range): Range {
  throw new Error('Gotta implement this!');
}

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
      preLoadChartState.metadataBySeriesId,
      selectXDomain(preLoadChartState),
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

    _.each(loadPromiseBySeriesId, (dataPromise, seriesId) =>
      dataPromise
      .then(data => {
        const postLoadChartState = getState();
        if (preLoadChartState.loadVersion === postLoadChartState.loadVersion && _.includes(postLoadChartState.seriesIds, seriesId)) {
          batchedDataReturned({
            [seriesId]: data
          });

          batchedSetYDomains({
            [seriesId]: _computeYDomain(
              seriesId,
              data,
              preLoadChartState.metadataBySeriesId[seriesId],
              // Note that we DON'T use the selector here. We want the fallback value to always be the true internal
              // value, which is incidentally also the value that's computed by this call to _computeYDomain.
              postLoadChartState.uiState.yDomainBySeriesId[seriesId]
            )
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

export function setMetadata(payload: TBySeriesId<any>): Action<TBySeriesId<any>> {
  return {
    type: ActionType.SET_METADATA,
    payload
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
