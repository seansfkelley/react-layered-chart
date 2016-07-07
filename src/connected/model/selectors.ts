import * as _ from 'lodash';
import { createSelector } from 'reselect';

import { Interval } from '../../core';
import { TBySeriesId } from '../interfaces';
import { ChartState, UiState } from './state';

const selectUiStateInternal = (state: ChartState) => state.uiState;
const selectUiStateOverride = (state: ChartState) => state.uiStateConsumerOverrides;

function createUiStateSelector<T>(selectUiState: (state: ChartState) => UiState, fieldName: string): (state: ChartState) => T {
  return createSelector(
    selectUiState,
    (uiState: UiState) => uiState[fieldName]
  );
}

export const selectXDomain = createSelector(
  createUiStateSelector<Interval>(selectUiStateInternal, 'xDomain'),
  createUiStateSelector<Interval>(selectUiStateOverride, 'xDomain'),
  (internal: Interval, override: Interval) => override || internal
);

export const selectYDomains = createSelector(
  createUiStateSelector<TBySeriesId<Interval>>(selectUiStateInternal, 'yDomainBySeriesId'),
  createUiStateSelector<TBySeriesId<Interval>>(selectUiStateOverride, 'yDomainBySeriesId'),
  (internal: TBySeriesId<Interval>, override: TBySeriesId<Interval>) => override || internal
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

export const selectData = (state: ChartState) => state.dataBySeriesId;
