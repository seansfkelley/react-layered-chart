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

const MAGIC_KEY_CAUSE_JS_CANT_KEY_ON_PAIRS = '~!~!~';

export function mergeRangesOfSameType(seriesIds, rangeBySeriesId, metadataBySeriesId) {
  const unmergedDataByUnitAndType = {};
  const mergedData = [];

  _.each(seriesIds, seriesId => {
    const metadata = metadataBySeriesId[seriesId] || {};
    const newEntry = {
      range: rangeBySeriesId[seriesId],
      color: metadata.color,
      seriesIds: [ seriesId ]
    };

    if (metadata.unit && metadata.unitType) {
      const unitAndTypeKey = `${metadata.unit} ${MAGIC_KEY_CAUSE_JS_CANT_KEY_ON_PAIRS} ${metadata.unitType}`;
      const existingUnmergedData = unmergedDataByUnitAndType[unitAndTypeKey];

      if (existingUnmergedData) {
        existingUnmergedData.push(newEntry);
      } else {
        unmergedDataByUnitAndType[unitAndTypeKey] = [ newEntry ];
      }
    } else {
      mergedData.push(newEntry);
    }
  });

  _.each(unmergedDataByUnitAndType, unmergedData => {
    mergedData.push({
      range: {
        min: _.min(_.pluck(unmergedData, 'range.min')),
        max: _.max(_.pluck(unmergedData, 'range.max'))
      },
      color: _.pluck(unmergedData, 'color').reduce((a, b) => a === b ? a : 'rgba(0, 0, 0, 0.7)'),
      seriesIds: _.flatten(_.pluck(unmergedData, 'seriesIds'))
    })
  });

  return mergedData;
}
