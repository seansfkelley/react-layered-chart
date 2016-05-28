import { Range, ScaleFunction, Color, SeriesData } from '../../core';

import { DEFAULT_X_DOMAIN } from './constants';
import { SeriesId, TBySeriesId, DataLoader } from '../interfaces';

export interface DefaultChartState {
  xDomain?: Range;
  yDomains?: TBySeriesId<Range>;
}

export interface UiState {
  xDomain?: Range;
  yDomainBySeriesId?: TBySeriesId<Range>;
  hover?: number;
  selection?: Range;
}

export interface ChartState {
  physicalChartWidth: number;
  seriesIds: SeriesId[];
  dataBySeriesId: TBySeriesId<SeriesData>;
  metadataBySeriesId: TBySeriesId<any>;
  isLoadingBySeriesId: TBySeriesId<boolean>;
  errorBySeriesId: TBySeriesId<any>;
  loadVersion: string;
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
  metadataBySeriesId: {},
  isLoadingBySeriesId: {},
  errorBySeriesId: {},
  loadVersion: null,
  dataLoader: invalidLoader,
  uiState: {
    xDomain: DEFAULT_X_DOMAIN,
    yDomainBySeriesId: {},
  },
  uiStateConsumerOverrides: {}
};
