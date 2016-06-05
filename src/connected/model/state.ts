import { Interval, ScaleFunction, Color, SeriesData } from '../../core';

import { DEFAULT_X_DOMAIN } from './constants';
import { SeriesId, TBySeriesId, DataLoader } from '../interfaces';

export interface DefaultChartState {
  xDomain?: Interval;
  yDomains?: TBySeriesId<Interval>;
}

export interface UiState {
  xDomain?: Interval;
  yDomainBySeriesId?: TBySeriesId<Interval>;
  hover?: number;
  selection?: Interval;
}

export interface ChartState {
  physicalChartWidth: number;
  seriesIds: SeriesId[];
  dataBySeriesId: TBySeriesId<SeriesData>;
  loadVersionBySeriesId: TBySeriesId<string>;
  errorBySeriesId: TBySeriesId<any>;
  dataLoader: DataLoader;
  uiState: UiState;
  uiStateConsumerOverrides: UiState;
}

// Can't seem to get Typescript to like this function: either it doesn't return
// the right type, or the return statements are unreachable code.
export const invalidLoader: any = () => {
  throw new Error('No data loader specified.');
}

export const DEFAULT_CHART_STATE: ChartState = {
  physicalChartWidth: 200,
  seriesIds: [],
  dataBySeriesId: {},
  loadVersionBySeriesId: {},
  errorBySeriesId: {},
  dataLoader: invalidLoader,
  uiState: {
    xDomain: DEFAULT_X_DOMAIN,
    yDomainBySeriesId: {},
  },
  uiStateConsumerOverrides: {}
};
