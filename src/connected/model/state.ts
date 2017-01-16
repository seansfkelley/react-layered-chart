import { Interval } from '../../core';

import { DEFAULT_X_DOMAIN } from './constants';
import { SeriesId, TBySeriesId, DataLoader, LoadedSeriesData } from '../interfaces';

export interface DefaultChartState {
  xDomain?: Interval;
  yDomains?: TBySeriesId<Interval>;
}

export interface UiState {
  xDomain: Interval;
  yDomainBySeriesId: TBySeriesId<Interval>;
  hover?: number;
  selection?: Interval;
}

export interface ChartState {
  debounceTimeout: number;
  loaderContext?: any;
  physicalChartWidth: number;
  seriesIds: SeriesId[];
  loadedDataBySeriesId: TBySeriesId<LoadedSeriesData>;
  loadVersionBySeriesId: TBySeriesId<string>;
  errorBySeriesId: TBySeriesId<any>;
  dataLoader: DataLoader;
  uiState: UiState;
  uiStateConsumerOverrides: Partial<UiState>;
}

export const invalidLoader = (() => {
  throw new Error('No data loader specified.');
}) as any as DataLoader;

export const DEFAULT_CHART_STATE: ChartState = {
  debounceTimeout: 1000,
  physicalChartWidth: 200,
  seriesIds: [],
  loadedDataBySeriesId: {},
  loadVersionBySeriesId: {},
  errorBySeriesId: {},
  dataLoader: invalidLoader,
  uiState: {
    xDomain: DEFAULT_X_DOMAIN,
    yDomainBySeriesId: {},
  },
  uiStateConsumerOverrides: {}
};
