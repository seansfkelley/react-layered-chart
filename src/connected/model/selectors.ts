import * as _ from 'lodash';
import { createSelector } from 'reselect';

import { Interval, SeriesData } from '../../core';
import { TBySeriesId } from '../interfaces';
import { ChartState, UiState } from './state';

function createUiStateSelector<T>(selectUiState: (state: ChartState) => UiState, fieldName: string): (state: ChartState) => T {
  return createSelector(
    selectUiState,
    (uiState: UiState) => uiState[fieldName]
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
  createUiStateSelector<Interval>(selectUiStateInternal, 'xDomain'),
  createUiStateSelector<Interval>(selectUiStateOverride, 'xDomain'),
  (internal: Interval, override: Interval) => override || internal
);

export const selectYDomains = createSelector(
  selectLoadedYDomains,
  createUiStateSelector<TBySeriesId<Interval>>(selectUiStateInternal, 'yDomainBySeriesId'),
  createUiStateSelector<TBySeriesId<Interval>>(selectUiStateOverride, 'yDomainBySeriesId'),
  (loaded, internal, override) => _.assign({}, loaded, internal, override) as TBySeriesId<Interval>
);

export const selectHover = createSelector(
  createUiStateSelector<number>(selectUiStateInternal, 'hover'),
  createUiStateSelector<number>(selectUiStateOverride, 'hover'),
  (internal: number, override: number) => _.isNumber(override) ? override : internal
);

export const selectSelection = createSelector(
  createUiStateSelector<Interval>(selectUiStateInternal, 'selection'),
  createUiStateSelector<Interval>(selectUiStateOverride, 'selection'),
  (internal: Interval, override: Interval) => override || internal
);

