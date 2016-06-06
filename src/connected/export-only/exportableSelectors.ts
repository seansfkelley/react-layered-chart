import * as _ from 'lodash';
import { createSelector } from 'reselect';

import { Interval } from '../../core';
import {
  selectXDomain as internalSelectXDomain,
  selectYDomains as internalSelectYDomains,
  selectHover as internalSelectHover,
  selectSelection as internalSelectSelection,
  selectData as internalSelectData
} from '../model/selectors';
import { ChartState } from '../model/state';
import { ChartProviderState } from './exportableState';
import { SeriesId, TBySeriesId } from '../interfaces';

function _wrapForTypeCast<T>(selector: (state: ChartState) => T): (state: ChartProviderState) => T {
  return (state: ChartProviderState) => selector(state as any as ChartState);
}

export const selectXDomain = _wrapForTypeCast(internalSelectXDomain);
export const selectYDomains = _wrapForTypeCast(internalSelectYDomains);
export const selectHover = _wrapForTypeCast(internalSelectHover);
export const selectSelection = _wrapForTypeCast(internalSelectSelection);
export const selectData = _wrapForTypeCast(internalSelectData);

export const selectIsLoading = _wrapForTypeCast((state: ChartState) => _.mapValues(state.loadVersionBySeriesId, v => !!v));
export const selectError = _wrapForTypeCast((state: ChartState) => state.errorBySeriesId);
export const selectChartPixelWidth = _wrapForTypeCast((state: ChartState) => state.physicalChartWidth);

// We inherit the name of "iterator" from Lodash. I would prefer this to be called a "selector", but obviously that
// may be confusing in this context.
export type NumericalValueIterator = (seriesId: SeriesId, datum: any) => number;

export function createSelectDataForHover(xValueSelector: NumericalValueIterator) {
  return _wrapForTypeCast(createSelector(
    internalSelectData,
    internalSelectHover,
    (dataBySeriesId: TBySeriesId<any>, hover?: number) => {
      if (_.isNil(hover)) {
        return _.mapValues(dataBySeriesId, _.constant(undefined));
      } else {
        // This is cause sortedIndexBy prefers to have the same shape for the array items and the searched thing. We don't
        // know what that shape is, so we do some bullshit to make sure we can differentiate the hover value from the
        // other data.
        const haxWrappedHover = { __haxWrappedHover: hover };

        const xIterator = (seriesId: SeriesId, datum: any) => {
          return datum.hasOwnProperty('__haxWrappedHover')
            ? datum.__haxWrappedHover
            : xValueSelector(seriesId, datum);
        }

        return _.mapValues(dataBySeriesId, (data: any[], seriesId: SeriesId) => {
          // -1 because sortedIndexBy returns the first index that would be /after/ the input value, but we're trying to
          // get whichever value comes before. Note that this may return undefined, but that's specifically allowed:
          // there may not be an appropriate hover value for this series.
          return data[ _.sortedIndexBy(data, haxWrappedHover, xIterator.bind(null, seriesId)) - 1 ];
        });
      }
    }
  ));
}
