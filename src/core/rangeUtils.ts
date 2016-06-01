import * as _ from 'lodash';
import * as d3Scale from 'd3-scale';

import { Range } from '../core';

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

export function mergeRanges(ranges: Range[]): Range {
  if (ranges.length === 0) {
    return null;
  } else {
    return {
      min: _.min(_.map<Range, number>(ranges, 'min')),
      max: _.max(_.map<Range, number>(ranges, 'max'))
    };
  }
}

export function rangeContains(maybeLargerRange: Range, maybeSmallerRange: Range) {
  return maybeLargerRange.min <= maybeSmallerRange.min && maybeLargerRange.max >= maybeSmallerRange.max;
}

export function panRange(range: Range, delta: number): Range {
  return {
    min: range.min + delta,
    max: range.max + delta
  };
}

export function zoomRange(range: Range, factor: number, anchorBias: number = 0.5) {
  const currentExtent = range.max - range.min;
  const targetExtent = currentExtent / factor;
  const extentDelta = targetExtent - currentExtent;

  return {
    min: range.min - extentDelta * anchorBias,
    max: range.max + extentDelta * (1 - anchorBias)
  };
}
