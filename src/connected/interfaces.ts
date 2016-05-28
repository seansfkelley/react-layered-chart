import { Range, SeriesData } from '../core';
import { ChartProviderState } from './export-only/exportableState';

export type SeriesId = string;
export type ChartId = string;
export type TBySeriesId<T> = { [seriesId: string]: T };
export type StateSelector<T> = (state: ChartProviderState) => T;
export interface LoadedSeriesData {
  data: SeriesData;
  yDomain: Range;
}
export type DataLoader = (seriesIds: SeriesId[],
                          metadataBySeriesId: TBySeriesId<any>,
                          xDomain: Range,
                          currentYDomains: TBySeriesId<Range>,
                          chartPixelWidth: number,
                          currentData: TBySeriesId<SeriesData>) => TBySeriesId<Promise<LoadedSeriesData>>;
