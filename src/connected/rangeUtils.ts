import * as _ from 'lodash';
import * as d3Scale from 'd3-scale';

import { Range } from '../core';
import { TBySeriesId, SeriesId } from './interfaces';

export function enforceRangeBounds(range: Range, bounds: Range): Range {
  const extent = range.max - range.min;
  const boundsExtent = bounds.max - bounds.min;
  if (extent > boundsExtent) {
    const halfExtentDiff = (extent - boundsExtent) / 2;
    return {
      min: bounds.min - halfExtentDiff,
      max: bounds.max + halfExtentDiff
    };
  } else if (range.min < bounds.min) {
    return {
      min: bounds.min,
      max: bounds.min + extent
    };
  } else if (range.max > bounds.max) {
    return {
      min: bounds.max - extent,
      max: bounds.max
    };
  } else {
    return range;
  }
}

export function enforceRangeExtent(range: Range, minExtent: number, maxExtent: number): Range {
  const extent = range.max - range.min;
  if (minExtent && extent < minExtent) {
    const halfExtentDiff = (minExtent - extent) / 2;
    return {
      min: range.min - halfExtentDiff,
      max: range.max + halfExtentDiff
    };
  } else if (maxExtent && extent > maxExtent) {
    const halfExtentDiff = (extent - maxExtent) / 2;
    return {
      min: range.min + halfExtentDiff,
      max: range.max - halfExtentDiff
    };
  } else {
    return range;
  }
}

export function extendRange(range: Range, factor: number): Range {
  const extent = Math.abs(range.max - range.min);
  return {
    min: range.min - extent * factor,
    max: range.max + extent * factor
  };
}

export function roundRange(range: Range): Range {
  return {
    min: Math.round(range.min),
    max: Math.round(range.max)
  };
}

export function niceRange(range: Range): Range {
  const nicedRange = d3Scale.scaleLinear().domain([ range.min, range.max ]).nice().domain();
  return {
    min: nicedRange[0],
    max: nicedRange[1]
  }
}

export function mergeRanges(ranges: TBySeriesId<Range>, groupingFn?: (seriesId: SeriesId) => string): TBySeriesId<Range> {
  // Make sure that all the series you care about are here!
  const allSeriesIds = _.keys(ranges);
  const groupedSeriesIds: { [key: string]: SeriesId[] }  = groupingFn
    ? _.groupBy(allSeriesIds, groupingFn)
    : { __dummyAllGroup: allSeriesIds };
  const rangeGroupsToMerge = _.map(groupedSeriesIds, seriesIds => {
    const relevantDomains = _.values(_.pick(ranges, seriesIds));
    return {
      seriesIds,
      range: {
        min: _.min(_.map(relevantDomains, 'min') as number[]),
        max: _.max(_.map(relevantDomains, 'max') as number[])
      }
    };
  });

  const mergedRanges: TBySeriesId<Range> = {};
  _.each(rangeGroupsToMerge, ({ seriesIds, range }) => {
    _.each(seriesIds, seriesId => mergedRanges[seriesId] = range)
  });

  return mergedRanges;
}

export function rangeContains(maybeLargerRange: Range, maybeSmallerRange: Range) {
  return maybeLargerRange.min <= maybeSmallerRange.min && maybeLargerRange.max >= maybeSmallerRange.max;
}
