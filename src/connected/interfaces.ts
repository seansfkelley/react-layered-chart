import { Range } from '../interfaces';
import { LayerCakeChartState } from './export-only/exportableState';

export type SeriesId = string;
export type ChartId = string;
export type SeriesData = any[];
export type TBySeriesId<T> = { [seriesId: string]: T };
export type StateSelector<T> = (state: LayerCakeChartState) => T;
export type DataLoader = (seriesIds: SeriesId[],
                          metadataBySeriesId: TBySeriesId<any>,
                          xDomain: Range,
                          chartPixelWidth: number,
                          currentData: TBySeriesId<SeriesData>) => TBySeriesId<Promise<SeriesData>>;
