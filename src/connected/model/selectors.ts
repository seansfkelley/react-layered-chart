import * as _ from 'lodash';
import { createSelector } from 'reselect';

import { Interval, SeriesData } from '../../core';
import { TBySeriesId } from '../interfaces';
import { ChartState, OverriddenUiState, UiState } from './state';

function createUiStateSelector<T>(fieldName: string): (state: ChartState) => T {
  return createSelector(
    selectUiStateInternal,
    (uiState: UiState) => uiState[fieldName]
  );
}

function createOverriddenUiStateSelector<T>(fieldName: string): (state: ChartState) => T {
  return createSelector(
      selectUiStateOverride,
      (uiState: OverriddenUiState) => uiState[fieldName]
  );
}

const selectLoadedSeriesData = (state: ChartState) => state.loadedDataBySeriesId;
const selectUiStateInternal = (state: ChartState) => state.uiState;
const selectUiStateOverride = (state: ChartState) => state.uiStateConsumerOverrides;

export const selectLoadedYDomains = createSelector(
  selectLoadedSeriesData,
  (loadedSeriesData) => _.mapValues(loadedSeriesData, loadedSeriesData => loadedSeriesData.yDomain) as TBySeriesId<Interval>
);

export const selectData = createSelector(
  selectLoadedSeriesData,
  (loadedSeriesData) => _.mapValues(loadedSeriesData, loadedSeriesData => loadedSeriesData.data) as TBySeriesId<SeriesData>
);

export const selectXDomain = createSelector(
  createUiStateSelector<Interval>('xDomain'),
  createOverriddenUiStateSelector<Interval>('xDomain'),
  (internal: Interval, override: Interval) => override || internal
);

export const selectYDomains = createSelector(
  selectLoadedYDomains,
  createUiStateSelector<TBySeriesId<Interval>>('yDomainBySeriesId'),
  createOverriddenUiStateSelector<TBySeriesId<Interval>>('yDomainBySeriesId'),
  (loaded, internal, override) => _.assign({}, loaded, internal, override) as TBySeriesId<Interval>
);

export const selectHover = createSelector(
  createUiStateSelector<number>('hover'),
  createOverriddenUiStateSelector<number | 'none'>('hover'),
  (internal: number, override: number | 'none'): number => {
    if (override != null) {
      return override === 'none' ? null : (override as number);
    } else {
      return internal;
    }
  }
);

export const selectSelection = createSelector(
  createUiStateSelector<Interval>('selection'),
  createOverriddenUiStateSelector<Interval | 'none'>('selection'),
  (internal: Interval, override: Interval | 'none'): Interval => {
      if (override != null) {
        return override === 'none' ? null : (override as Interval);
      } else {
        return internal;
      }
  }
);

