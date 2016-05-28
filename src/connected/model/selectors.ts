import * as _ from 'lodash';
import { Range } from 'react-layered-chart';
import { createSelector } from 'reselect';

import { ChartState, UiState } from './state';
import { TBySeriesId } from './typedefs';

const selectUiStateInternal = (state: ChartState) => state.uiState;
const selectUiStateOverride = (state: ChartState) => state.uiStateConsumerOverrides;

function createUiStateSelector<T>(selectUiState: (state: ChartState) => UiState, fieldName: string): (state: ChartState) => T {
  return createSelector(
    selectUiState,
    (uiState: UiState) => uiState[fieldName]
  )
}

export const selectXDomain = createSelector(
  createUiStateSelector<Range>(selectUiStateInternal, 'xDomain'),
  createUiStateSelector<Range>(selectUiStateOverride, 'xDomain'),
  (internal: Range, override: Range) => override || internal
);

export const selectYDomains = createSelector(
  createUiStateSelector<TBySeriesId<Range>>(selectUiStateInternal, 'yDomainBySeriesId'),
  createUiStateSelector<TBySeriesId<Range>>(selectUiStateOverride, 'yDomainBySeriesId'),
  (internal: TBySeriesId<Range>, override: TBySeriesId<Range>) => <TBySeriesId<Range>> _.extend({}, internal, override)
);

export const selectHover = createSelector(
  createUiStateSelector<number>(selectUiStateInternal, 'hover'),
  createUiStateSelector<number>(selectUiStateOverride, 'hover'),
  (internal: number, override: number) => override || internal
);

export const selectSelection = createSelector(
  createUiStateSelector<Range>(selectUiStateInternal, 'selection'),
  createUiStateSelector<Range>(selectUiStateOverride, 'selection'),
  (internal: Range, override: Range) => override || internal
);
