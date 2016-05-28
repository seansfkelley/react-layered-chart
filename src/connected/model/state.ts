import { Range, ScaleFunction, HexColor } from 'react-layered-chart';

import LayerType from './LayerType';
import { DEFAULT_X_DOMAIN } from './constants';
import { SeriesId, TBySeriesId, DataLoader, SeriesData } from './typedefs';
import computedChannelsLoader from '../flux/computedChannelsLoader';

export interface DefaultChartState {
  xDomain?: Range;
  yDomains?: TBySeriesId<Range>;
}

export interface SeriesMetadata {
  layerType: LayerType;
  color?: HexColor;
  yScale?: ScaleFunction;
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
  metadataBySeriesId: TBySeriesId<SeriesMetadata>;
  isLoadingBySeriesId: TBySeriesId<boolean>;
  errorBySeriesId: TBySeriesId<any>;
  loadVersion: string;
  dataLoader: DataLoader;
  uiState: UiState;
  uiStateConsumerOverrides: UiState;
}

export const DEFAULT_CHART_STATE: ChartState = {
  physicalChartWidth: 200,
  seriesIds: [],
  dataBySeriesId: {},
  metadataBySeriesId: {},
  isLoadingBySeriesId: {},
  errorBySeriesId: {},
  loadVersion: null,
  dataLoader: computedChannelsLoader,
  uiState: {
    xDomain: DEFAULT_X_DOMAIN,
    yDomainBySeriesId: {},
  },
  uiStateConsumerOverrides: {}
};
