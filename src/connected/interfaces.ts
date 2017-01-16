import { GenericStoreEnhancer, Middleware } from 'redux';
import { Interval, SeriesData } from '../core';

export type SeriesId = string;

export type ChartId = string;

export type TBySeriesId<T> = { [seriesId: string]: T };

export interface LoadedSeriesData {
  data: SeriesData;
  yDomain: Interval;
}

export type DataLoader = (seriesIds: SeriesId[],
                          xDomain: Interval,
                          currentYDomains: TBySeriesId<Interval>,
                          chartPixelWidth: number,
                          currentData: TBySeriesId<SeriesData>,
                          currentLoadedData: TBySeriesId<LoadedSeriesData>,
                          context?: any) => TBySeriesId<Promise<LoadedSeriesData>>;

export interface DebugStoreHooks {
  middlewares?: Middleware[];
  enhancers?: GenericStoreEnhancer[];
};
