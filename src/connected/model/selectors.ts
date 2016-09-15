import * as _ from 'lodash';
import { createSelector } from 'reselect';

import { Interval } from '../../core';
import { TBySeriesId } from '../interfaces';
import { ChartState, UiState } from './state';

function createUiStateSelector<T>(selectUiState: (state: ChartState) => UiState, fieldName: string): (state: ChartState) => T {
  return createSelector(
    selectUiState,
    (uiState: UiState) => uiState[fieldName]
  );
}

export const selectIsLoading = (state: ChartState) => _.mapValues(state.loadVersionBySeriesId, v => !!v) as TBySeriesId<boolean>;
export const selectError = (state: ChartState) => state.errorBySeriesId;
export const selectChartPixelWidth = (state: ChartState) => state.physicalChartWidth;

const selectLoadedSeriesData = (state: ChartState) => state.loadedDataBySeriesId;

export const selectData = createSelector(
  selectLoadedSeriesData,
  (loadedSeriesData) => _.mapValues(loadedSeriesData, loadedSeriesData => loadedSeriesData.data)
);

const selectUiStateInternal = (state: ChartState) => state.uiState;
const selectUiStateOverride = (state: ChartState) => state.uiStateConsumerOverrides;

export const selectXDomainInternal = createUiStateSelector<Interval>(selectUiStateInternal, 'xDomain');
export const selectXDomain = createSelector(
  selectXDomainInternal,
  createUiStateSelector<Interval>(selectUiStateOverride, 'xDomain'),
  (internal: Interval, override: Interval) => override || internal
);

export const selectYDomainsInternal = createUiStateSelector<TBySeriesId<Interval>>(selectUiStateInternal, 'yDomainBySeriesId');
export const selectYDomainsLoaded = createSelector(
  selectLoadedSeriesData,
  (loadedSeriesData) => _.mapValues(loadedSeriesData, loadedSeriesData => loadedSeriesData.yDomain)
);
export const selectYDomains = createSelector(
  selectYDomainsLoaded,
  selectYDomainsInternal,
  createUiStateSelector<TBySeriesId<Interval>>(selectUiStateOverride, 'yDomainBySeriesId'),
  (loaded: TBySeriesId<Interval>, internal: TBySeriesId<Interval>, override: TBySeriesId<Interval>) =>
    _.assign({}, loaded, internal, override) as TBySeriesId<Interval>
);

export const selectHoverInternal = createUiStateSelector<number>(selectUiStateInternal, 'hover');
export const selectHover = createSelector(
  selectHoverInternal,
  createUiStateSelector<number>(selectUiStateOverride, 'hover'),
  (internal: number, override: number) => _.isNumber(override) ? override : internal
);

export const selectSelectionInternal = createUiStateSelector<Interval>(selectUiStateInternal, 'selection');
export const selectSelection = createSelector(
  selectSelectionInternal,
  createUiStateSelector<Interval>(selectUiStateOverride, 'selection'),
  (internal: Interval, override: Interval) => override || internal
);

