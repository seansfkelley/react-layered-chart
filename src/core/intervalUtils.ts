import * as _ from 'lodash';
import { scaleLinear } from 'd3-scale';

import { Interval } from '../core';

export function enforceIntervalBounds(interval: Interval, bounds?: Interval): Interval {
  if (!bounds) {
    return interval;
  }

  const extent = intervalExtent(interval);
  const boundsExtent = intervalExtent(bounds);
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

export function enforceIntervalExtent(interval: Interval, minExtent?: number, maxExtent?: number): Interval {
  const extent = intervalExtent(interval);
  if (minExtent != null && extent < minExtent) {
    const halfExtentDiff = (minExtent - extent) / 2;
    return {
      min: interval.min - halfExtentDiff,
      max: interval.max + halfExtentDiff
    };
  } else if (maxExtent != null && extent > maxExtent) {
    const halfExtentDiff = (extent - maxExtent) / 2;
    return {
      min: interval.min + halfExtentDiff,
      max: interval.max - halfExtentDiff
    };
  } else {
    return interval;
  }
}

export function intervalExtent(interval: Interval): number {
  return interval.max - interval.min;
}

export function extendInterval(interval: Interval, factor: number): Interval {
  const extent = intervalExtent(interval);
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
  const nicedInterval = scaleLinear().domain([ interval.min, interval.max ]).nice().domain();
  return {
    min: nicedInterval[0],
    max: nicedInterval[1]
  };
}

export function mergeIntervals(intervals: Interval[]): Interval | undefined;
export function mergeIntervals(intervals: Interval[], defaultInterval: Interval): Interval;
export function mergeIntervals(intervals: Interval[], defaultInterval: undefined): Interval | undefined;

export function mergeIntervals(intervals: Interval[], defaultInterval?: Interval) {
  if (intervals.length === 0) {
    return defaultInterval || undefined;
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
  const currentExtent = intervalExtent(interval);
  const targetExtent = currentExtent / factor;
  const extentDelta = targetExtent - currentExtent;

  return {
    min: interval.min - extentDelta * anchorBias,
    max: interval.max + extentDelta * (1 - anchorBias)
  };
}
