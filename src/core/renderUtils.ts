import * as _ from 'lodash';

import { Interval, Ticks, TickFormat } from './interfaces';

export interface IndexBounds {
  firstIndex: number;
  lastIndex: number;
}

export type ValueAccessor<T> = string | ((value: T) => number);

function adjustBounds(firstIndex: number, lastIndex: number, dataLength: number): IndexBounds {
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

// This is cause sortedIndexBy prefers to have the same shape for the array items and the searched thing. We don't
// know what that shape is, so we have a sentinel + accompanying function to figure out when it's asking for this value.
type BoundSentinel = { __boundSentinelBrand: string };
const LOWER_BOUND_SENTINEL: BoundSentinel = (() => {}) as any;
const UPPER_BOUND_SENTINEL: BoundSentinel = (() => {}) as any;

// Assumption: data is sorted by `xValuePath` acending.
export function getIndexBoundsForPointData<T>(data: T[], xValueBounds: Interval, xValueAccessor: ValueAccessor<T>): IndexBounds {
  let lowerBound;
  let upperBound;
  let accessor;

  if (_.isString(xValueAccessor)) {
    lowerBound = _.set({}, xValueAccessor, xValueBounds.min);
    upperBound = _.set({}, xValueAccessor, xValueBounds.max);
    accessor = xValueAccessor;
  } else {
    lowerBound = LOWER_BOUND_SENTINEL;
    upperBound = UPPER_BOUND_SENTINEL;
    accessor = (value: T | BoundSentinel) => {
      if (value === LOWER_BOUND_SENTINEL) {
        return xValueBounds.min;
      } else if (value === UPPER_BOUND_SENTINEL) {
        return xValueBounds.max;
      } else {
        return xValueAccessor(value as T);
      }
    };
  }

  const firstIndex = _.sortedIndexBy(data, lowerBound, accessor);
  const lastIndex = _.sortedLastIndexBy(data, upperBound, accessor);

  return adjustBounds(firstIndex, lastIndex, data.length);
}

// Assumption: data is sorted by `minXValuePath` ascending.
export function getIndexBoundsForSpanData<T>(data: T[], xValueBounds: Interval, minXValueAccessor: ValueAccessor<T>, maxXValueAccessor: ValueAccessor<T>): IndexBounds {
  let upperBound;
  let upperBoundAccessor;

  // Note that this purposely mixes the min accessor/max value. Think about it.
  if (_.isString(minXValueAccessor)) {
    upperBound = _.set({}, minXValueAccessor, xValueBounds.max);
    upperBoundAccessor = minXValueAccessor;
  } else {
    upperBound = UPPER_BOUND_SENTINEL;
    upperBoundAccessor = (value: T | BoundSentinel) => {
      if (value === UPPER_BOUND_SENTINEL) {
        return xValueBounds.max;
      } else {
        return minXValueAccessor(value as T);
      }
    }
  }

  const lowerBoundAccessor = _.isString(maxXValueAccessor)
    ? (value: T) => _.get(value, maxXValueAccessor)
    : maxXValueAccessor;

  // Also note that this is a loose bound -- there could be spans that start later and end earlier such that
  // they don't actually fit inside the bounds, but this still saves us work in the end.
  const lastIndex = _.sortedLastIndexBy(data, upperBound, upperBoundAccessor);
  let firstIndex;
  for (firstIndex = 0; firstIndex < lastIndex; ++firstIndex) {
    if (lowerBoundAccessor(data[firstIndex]) >= xValueBounds.min) {
      break;
    }
  }

  return adjustBounds(firstIndex, lastIndex, data.length);
}

const DEFAULT_TICK_AMOUNT = 5;

export function computeTicks(scale: any, ticks?: Ticks, tickFormat?: TickFormat) {
  let outputTicks: number[];
  if (ticks) {
    if (_.isFunction(ticks)) {
      const [ min, max ] = scale.domain();
      const maybeOutputTicks = ticks({ min, max });
      if (_.isNumber(maybeOutputTicks)) {
        outputTicks = scale.ticks(maybeOutputTicks);
      } else {
        outputTicks = maybeOutputTicks;
      }
    } else if (_.isArray<number>(ticks)) {
      outputTicks = ticks;
    } else if (_.isNumber(ticks)) {
      outputTicks = scale.ticks(ticks);
    } else {
      throw new Error('ticks must be a function, array or number');
    }
  } else {
    outputTicks = scale.ticks(DEFAULT_TICK_AMOUNT);
  }

  let format: Function;
  if (_.isFunction(tickFormat)) {
    format = tickFormat;
  } else {
    const tickCount = _.isNumber(ticks) ? ticks : DEFAULT_TICK_AMOUNT;
    format = scale.tickFormat(tickCount, tickFormat);
  }

  return { ticks: outputTicks, format };
}
