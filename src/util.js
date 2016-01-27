import _ from 'lodash';

function adjustBounds(firstIndex, lastIndex, dataLength) {
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
export function getBoundsForInstantaeousData(timestampedData, timeRange, timestampPath = 'timestamp') {
  const lowerBound = _.set({}, timestampPath, timeRange.min);
  const upperBound = _.set({}, timestampPath, timeRange.max);

  const firstIndex = _.sortedIndexBy(timestampedData, lowerBound, timestampPath);
  const lastIndex = _.sortedLastIndexBy(timestampedData, upperBound, timestampPath);

  return adjustBounds(firstIndex, lastIndex, timestampedData.length);
}

// Assumption: data is sorted by `minPath` ascending.
export function getBoundsForTimeSpanData(timeSpanData, timeRange, minPath = 'timeSpan.min', maxPath = 'timeSpan.max') {
  // Note that these are purposely reversed. Think about it.
  const lowerBound = _.set({}, maxPath, timeRange.min);
  const upperBound = _.set({}, minPath, timeRange.max);

  // Also note that this is a loose bound -- there could be spans that start later and end earlier such that
  // they don't actually fit inside the bounds, but 80-20 this is speedy and still correct, though wasteful.
  const firstIndex = _.sortedIndexBy(timeSpanData, lowerBound, maxPath);
  const lastIndex = _.sortedLastIndexBy(timeSpanData, upperBound, minPath);

  return adjustBounds(firstIndex, lastIndex, timeSpanData.length);
}

export function resolvePan(timeRange, delta) {
  return {
    min: timeRange.min + delta,
    max: timeRange.max + delta
  };
}

export function resolveZoom(timeRange, factor, anchorBias = 0.5) {
  const currentExtent = timeRange.max - timeRange.min;
  const targetExtent = currentExtent / factor;
  const extentDelta = targetExtent - currentExtent;

  return {
    min: timeRange.min - extentDelta * anchorBias,
    max: timeRange.max + extentDelta * (1 - anchorBias)
  };
}

export default {
  getBoundsForInstantaeousData,
  getBoundsForTimeSpanData,
  resolvePan,
  resolveZoom
};
