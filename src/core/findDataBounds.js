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

// Assumption: data is sorted by timestamp acending.
export function getBoundsForInstantaeousData(timestampedData, timeRange) {
  const firstIndex = _.sortedIndex(timestampedData, { timestamp: timeRange.min }, 'timestamp');
  const lastIndex = _.sortedLastIndex(timestampedData, { timestamp: timeRange.max }, 'timestamp');

  return adjustBounds(firstIndex, lastIndex, timestampedData.length);
}

// Assumption: data is sorted by timeSpan.min ascending.
export function getBoundsForTimeSpanData(timeSpanData, timeRange, minPath = 'timeSpan.min', maxPath = 'timeSpan.max') {
  // Note that these are purposely reversed. Think about it.
  const lowerBound = {};
  _.set(lowerBound, maxPath, timeRange.min);
  const upperBound = {};
  _.set(upperBound, minPath, timeRange.max);

  // Also note that this is a loose bound -- there could be spans that start later and end earlier such that
  // they don't actually fit inside the bounds, but 80-20 this is speedy and still correct, though wasteful.
  const firstIndex = _.sortedIndex(timeSpanData, lowerBound, maxPath);
  const lastIndex = _.sortedLastIndex(timeSpanData, upperBound, minPath);

  return adjustBounds(firstIndex, lastIndex, timeSpanData.length);
}
