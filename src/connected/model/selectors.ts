import * as _ from 'lodash';
import { createSelector } from 'reselect';

import { Interval, SeriesData } from '../../core';
import { TBySeriesId } from '../interfaces';
import { ChartState, UiState } from './state';

function createSubSelector<S, F extends keyof S>(selectParentState: (state: ChartState) => S, fieldName: F): (state: ChartState) => S[F] {
  return createSelector(
    selectParentState,
    state => state[fieldName]
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
  createSubSelector(selectUiStateInternal, 'xDomain'),
  createSubSelector(selectUiStateOverride, 'xDomain'),
  (internal, override) => override || internal
);

export const selectYDomains = createSelector(
  selectLoadedYDomains,
  createSubSelector(selectUiStateInternal, 'yDomainBySeriesId'),
  createSubSelector(selectUiStateOverride, 'yDomainBySeriesId'),
  (loaded, internal, override) => _.assign({}, loaded, internal, override) as TBySeriesId<Interval>
);

export const selectHover = createSelector(
  createSubSelector(selectUiStateInternal, 'hover'),
  createSubSelector(selectUiStateOverride, 'hover'),
  (internal, override) => _.isNumber(override) ? override : internal
);

export const selectSelection = createSelector(
  createSubSelector(selectUiStateInternal, 'selection'),
  createSubSelector(selectUiStateOverride, 'selection'),
  (internal, override) => override || internal
);
