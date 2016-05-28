import * as _ from 'lodash';
import { Range, DataBucket } from 'react-layered-chart';

import LayerType from './model/LayerType';
import { SeriesData } from './model/typedefs';
import { rangeContains } from './rangeUtils';

function _generateGetterByLayerType(fieldsByType: { [layerType: string]: string }, nounPhrase: string) {
  return function(layerType: LayerType, datum: any): number {
    const field = fieldsByType[layerType];
    if (!fieldsByType) {
      throw new Error(`Cannot get ${nounPhrase} for unknown LayerType: ${layerType}`);
    } else {
      return datum[field];
    }
  };
}

export const getStartTimeByLayerType = _generateGetterByLayerType({
  [LayerType.POINT]: 'timestamp',
  [LayerType.LINE]: 'startTime'
}, 'start time');

export const getEndTimeByLayerType = _generateGetterByLayerType({
  [LayerType.POINT]: 'timestamp',
  [LayerType.LINE]: 'endTime'
}, 'end time');

export const getMinValueByLayerType = _generateGetterByLayerType({
  [LayerType.POINT]: 'value',
  [LayerType.LINE]: 'minValue'
}, 'min time');

export const getMaxValueByLayerType = _generateGetterByLayerType({
  [LayerType.POINT]: 'value',
  [LayerType.LINE]: 'maxValue'
}, 'max time');

function _currentDataCoversRange(data: SeriesData, layerType: LayerType, range: Range) {
  const firstDatum = _.first(data);
  const lastDatum = _.last(data);
  if (firstDatum && lastDatum) {
    const coveredRange = {
      min: getStartTimeByLayerType(layerType, firstDatum),
      max: getEndTimeByLayerType(layerType, lastDatum)
    };
    return rangeContains(coveredRange, range);
  } else {
    return false;
  }
}

function _dataBucketContainsOnePoint(bucket: DataBucket) {
  return bucket.startTime === bucket.endTime;
}

export function dataIsValidForRange(data: SeriesData, layerType: LayerType, range: Range) {
  switch (layerType) {
    case LayerType.LINE:
      return _currentDataCoversRange(data, layerType, range) && _.every(data, _dataBucketContainsOnePoint);

    case LayerType.POINT:
      return _currentDataCoversRange(data, layerType, range);

    default:
      throw new Error(`Cannot interpret data for unknown LayerType: ${layerType}.`);
  }
}
