import _ from 'lodash';

export function getBoundsForInstantaeousData(timestampedData, timeRange) {
  const firstIndex = _.sortedIndex(timestampedData, { timestamp: timeRange.min }, 'timestamp');
  const lastIndex = _.sortedLastIndex(timestampedData, { timestamp: timeRange.max }, 'timestamp');

  // No data is visible!
  if (firstIndex === timestampedData.length || lastIndex === 0) {
    return { firstIndex, lastIndex };
  }

  // In the case where the data crosses a range boundary, the sortedIndex calculations will be off by one.
  return {
    firstIndex: Math.max(0, firstIndex - 1),
    lastIndex: Math.min(timestampedData.length, lastIndex + 1)
  };
}
