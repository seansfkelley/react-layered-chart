import * as _ from 'lodash';
import { createSelector } from 'reselect';

import { Interval } from '../../core';
import {
  selectXDomain as selectXDomainPrivate,
  selectYDomains as selectYDomainsPrivate,
  selectHover as selectHoverPrivate,
  selectSelection as selectSelectionPrivate,
  selectData as selectDataPrivate,
  selectIsLoading as selectIsLoadingPrivate,
  selectError as selectErrorPrivate,
  selectChartPixelWidth as selectChartPixelWidthPrivate
} from '../model/selectors';
import { ChartState } from '../model/state';
import { ChartProviderState } from './exportableState';
import { SeriesId, TBySeriesId, StateSelector } from '../interfaces';

function _wrapForTypeCast<T>(selector: (state: ChartState) => T): StateSelector<T> {
  return (state: ChartProviderState) => selector(state as any as ChartState);
}

export const selectXDomain = _wrapForTypeCast(selectXDomainPrivate);
export const selectYDomains = _wrapForTypeCast(selectYDomainsPrivate);
export const selectHover = _wrapForTypeCast(selectHoverPrivate);
export const selectSelection = _wrapForTypeCast(selectSelectionPrivate);
export const selectData = _wrapForTypeCast(selectDataPrivate);
export const selectIsLoading = _wrapForTypeCast(selectIsLoadingPrivate);
export const selectError = _wrapForTypeCast(selectErrorPrivate);
export const selectChartPixelWidth = _wrapForTypeCast(selectChartPixelWidthPrivate);

// We inherit the name of "iterator" from Lodash. I would prefer this to be called a "selector", but obviously that
// may be confusing in this context.
export type NumericalValueIterator = (seriesId: SeriesId, datum: any) => number;

export function createSelectDataForHover(xValueSelector: NumericalValueIterator): StateSelector<TBySeriesId<any>> {
  return _wrapForTypeCast(createSelector(
    selectDataPrivate,
    selectHoverPrivate,
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
        };

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
