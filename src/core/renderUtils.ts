import * as _ from 'lodash';

import { SeriesData, Range, Ticks, TickFormat } from './interfaces';

export interface IndexBounds {
  firstIndex: number;
  lastIndex: number;
}

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

// Assumption: data is sorted by `xValuePath` acending.
export function getIndexBoundsForPointData(data: SeriesData, xValueBounds: Range, xValuePath: string): IndexBounds {
  const lowerBound = _.set({}, xValuePath, xValueBounds.min);
  const upperBound = _.set({}, xValuePath, xValueBounds.max);

  const firstIndex = _.sortedIndexBy(data, lowerBound, xValuePath);
  const lastIndex = _.sortedLastIndexBy(data, upperBound, xValuePath);

  return adjustBounds(firstIndex, lastIndex, data.length);
}

// Assumption: data is sorted by `minXValuePath` ascending.
export function getIndexBoundsForSpanData(data: SeriesData, xValueBounds: Range, minXValuePath: string, maxXValuePath: string): IndexBounds {
  // Note that this is purposely reversed. Think about it.
  const upperBound = _.set({}, minXValuePath, xValueBounds.max);

  // Also note that this is a loose bound -- there could be spans that start later and end earlier such that
  // they don't actually fit inside the bounds, but this still saves us work in the end.
  const lastIndex = _.sortedLastIndexBy(data, upperBound, minXValuePath);
  let firstIndex;
  for (firstIndex = 0; firstIndex < lastIndex; ++firstIndex) {
    if (_.get(data[firstIndex], maxXValuePath) >= xValueBounds.min) {
      break;
    }
  }

  return adjustBounds(firstIndex, lastIndex, data.length);
}

export function computeTicks(scale: any, domain: Range, ticks?: Ticks, tickFormat?: TickFormat) {
  let outputTicks: number[];
  if (ticks) {
    if (_.isFunction(ticks)) {
      outputTicks = ticks(domain);
    } else if (_.isArray<number>(ticks)) {
      outputTicks = ticks;
    } else if (_.isNumber(ticks)) {
      outputTicks = scale.ticks(ticks);
    } else {
      throw new Error('ticks must be a function, array or number');
    }
  } else {
    outputTicks = scale.ticks(5);
  }
  const tickCount = _.isNumber(ticks) ? ticks : 5;
  const format = scale.tickFormat(tickCount, tickFormat);

  return { ticks: outputTicks, format };
}
