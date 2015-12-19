import _ from 'lodash';

export function getVisibleIndexBounds(timestampedData, domain) {
  const firstIndex = _.sortedIndex(timestampedData, { timestamp: domain.start }, 'timestamp');
  const lastIndex = _.sortedLastIndex(timestampedData, { timestamp: domain.end }, 'timestamp');

  // No data is visible!
  if (firstIndex === timestampedData.length || lastIndex === 0) {
    return { firstIndex, lastIndex };
  }

  // In the case where the data crosses a domain boundary, the sortedIndex calculations will be off by one.
  return {
    firstIndex: Math.max(0, firstIndex - 1),
    lastIndex: Math.min(timestampedData.length - 1, lastIndex + 1)
  };
}
