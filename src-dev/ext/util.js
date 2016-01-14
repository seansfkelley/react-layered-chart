import _ from 'lodash';

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
        min: _.min(_.map(unmergedData, 'range.min')),
        max: _.max(_.map(unmergedData, 'range.max'))
      },
      // _.reduce, unlike Array.reduce, doesn't throw when given an empty array + no default value.
      color: _.reduce(_.map(unmergedData, 'color'), (a, b) => a === b ? a : 'rgba(0, 0, 0, 0.7)'),
      seriesIds: _.flatten(_.map(unmergedData, 'seriesIds'))
    })
  });

  return mergedData;
}
