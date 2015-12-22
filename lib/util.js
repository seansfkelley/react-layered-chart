import _ from 'lodash';

export function getVisibleIndexBounds(timestampedData, timeRange) {
  const firstIndex = _.sortedIndex(timestampedData, { timestamp: timeRange.min }, 'timestamp');
  const lastIndex = _.sortedLastIndex(timestampedData, { timestamp: timeRange.max }, 'timestamp');

  // No data is visible!
  if (firstIndex === timestampedData.length || lastIndex === 0) {
    return { firstIndex, lastIndex };
  }

  // In the case where the data crosses a range boundary, the sortedIndex calculations will be off by one.
  return {
    firstIndex: Math.max(0, firstIndex - 1),
    lastIndex: Math.min(timestampedData.length - 1, lastIndex + 1)
  };
}

export function shallowMemoize(fn) {
  let lastArgs;
  let lastResult;
  return function() {
    if (lastArgs && lastArgs.length === arguments.length && _.all(lastArgs, (arg, i) => arg === arguments[i])) {
      return lastResult;
    } else {
      lastArgs = arguments;
      lastResult = fn.apply(this, arguments);
      return lastResult;
    }
  };
}
