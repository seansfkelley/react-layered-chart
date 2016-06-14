import * as _ from 'lodash';
import * as d3Scale from 'd3-scale';

import { Interval } from '../core';

export function enforceIntervalBounds(interval: Interval, bounds: Interval): Interval {
  const extent = interval.max - interval.min;
  const boundsExtent = bounds.max - bounds.min;
  if (extent > boundsExtent) {
    const halfExtentDiff = (extent - boundsExtent) / 2;
    return {
      min: bounds.min - halfExtentDiff,
      max: bounds.max + halfExtentDiff
    };
  } else if (interval.min < bounds.min) {
    return {
      min: bounds.min,
      max: bounds.min + extent
    };
  } else if (interval.max > bounds.max) {
    return {
      min: bounds.max - extent,
      max: bounds.max
    };
  } else {
    return interval;
  }
}

export function enforceIntervalExtent(interval: Interval, minExtent: number, maxExtent: number): Interval {
  const extent = interval.max - interval.min;
  if (minExtent && extent < minExtent) {
    const halfExtentDiff = (minExtent - extent) / 2;
    return {
      min: interval.min - halfExtentDiff,
      max: interval.max + halfExtentDiff
    };
  } else if (maxExtent && extent > maxExtent) {
    const halfExtentDiff = (extent - maxExtent) / 2;
    return {
      min: interval.min + halfExtentDiff,
      max: interval.max - halfExtentDiff
    };
  } else {
    return interval;
  }
}

export function extendInterval(interval: Interval, factor: number): Interval {
  const extent = Math.abs(interval.max - interval.min);
  return {
    min: interval.min - extent * factor,
    max: interval.max + extent * factor
  };
}

export function roundInterval(interval: Interval): Interval {
  return {
    min: Math.round(interval.min),
    max: Math.round(interval.max)
  };
}

export function niceInterval(interval: Interval): Interval {
  const nicedInterval = d3Scale.scaleLinear().domain([ interval.min, interval.max ]).nice().domain();
  return {
    min: nicedInterval[0],
    max: nicedInterval[1]
  }
}

export function mergeIntervals(intervals: Interval[], defaultInterval?: Interval): Interval {
  if (intervals.length === 0) {
    return defaultInterval || null;
  } else {
    return {
      min: _.min(_.map<Interval, number>(intervals, 'min')),
      max: _.max(_.map<Interval, number>(intervals, 'max'))
    };
  }
}

export function intervalContains(maybeLargerInterval: Interval, maybeSmallerInterval: Interval) {
  return maybeLargerInterval.min <= maybeSmallerInterval.min && maybeLargerInterval.max >= maybeSmallerInterval.max;
}

export function panInterval(interval: Interval, delta: number): Interval {
  return {
    min: interval.min + delta,
    max: interval.max + delta
  };
}

export function zoomInterval(interval: Interval, factor: number, anchorBias: number = 0.5): Interval {
  const currentExtent = interval.max - interval.min;
  const targetExtent = currentExtent / factor;
  const extentDelta = targetExtent - currentExtent;

  return {
    min: interval.min - extentDelta * anchorBias,
    max: interval.max + extentDelta * (1 - anchorBias)
  };
}
