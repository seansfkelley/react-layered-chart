import * as _ from 'lodash';

import { SeriesData, Range } from './interfaces';

export interface IndexBounds {
  firstIndex: number;
  lastIndex: number;
}

function adjustBounds(firstIndex: number, lastIndex: number, dataLength: number): IndexBounds {
  if (firstIndex === dataLength || lastIndex === 0) {
    // No data is visible!
    return { firstIndex, lastIndex };
  } else {
    // We want to include the previous and next data points so that e.g. lines drawn across the canvas
    // boundary still have somewhere to go.
    return {
      firstIndex: Math.max(0, firstIndex - 1),
      lastIndex: Math.min(dataLength, lastIndex + 1)
    };
  }
}

// Assumption: data is sorted by `timestampPath` acending.
export function getBoundsForInstantaeousData(timestampedData: SeriesData, timeRange: Range, timestampPath: string = 'timestamp'): IndexBounds {
  const lowerBound = _.set({}, timestampPath, timeRange.min);
  const upperBound = _.set({}, timestampPath, timeRange.max);

  const firstIndex = _.sortedIndexBy(timestampedData, lowerBound, timestampPath);
  const lastIndex = _.sortedLastIndexBy(timestampedData, upperBound, timestampPath);

  return adjustBounds(firstIndex, lastIndex, timestampedData.length);
}

// Assumption: data is sorted by `minPath` ascending.
export function getBoundsForTimeSpanData(timeSpanData: SeriesData, timeRange: Range, minPath: string = 'timeSpan.min', maxPath: string = 'timeSpan.max'): IndexBounds {
  // Note that this is purposely reversed. Think about it.
  const upperBound = _.set({}, minPath, timeRange.max);

  // Also note that this is a loose bound -- there could be spans that start later and end earlier such that
  // they don't actually fit inside the bounds, but this still saves us work in the end.
  const lastIndex = _.sortedLastIndexBy(timeSpanData, upperBound, minPath);
  let firstIndex;
  for (firstIndex = 0; firstIndex < lastIndex; ++firstIndex) {
    if (_.get(timeSpanData[firstIndex], maxPath) >= timeRange.min) {
      break;
    }
  }

  return adjustBounds(firstIndex, lastIndex, timeSpanData.length);
}

export function resolvePan(range: Range, delta: number): Range {
  return {
    min: range.min + delta,
    max: range.max + delta
  };
}

export function resolveZoom(range, factor: number, anchorBias: number = 0.5) {
  const currentExtent = range.max - range.min;
  const targetExtent = currentExtent / factor;
  const extentDelta = targetExtent - currentExtent;

  return {
    min: range.min - extentDelta * anchorBias,
    max: range.max + extentDelta * (1 - anchorBias)
  };
}

