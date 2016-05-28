import * as Promise from 'bluebird';
import { Range } from 'react-layered-chart';

import { SeriesMetadata } from './state';
import { LayerCakeChartState } from '../export-only/exportableState';

export type SeriesId = string;
export type ChartId = string;
export type SeriesData = any[];
export type TBySeriesId<T> = { [seriesId: string]: T };
export type StateSelector<T> = (state: LayerCakeChartState) => T;
export type DataLoader = (seriesIds: SeriesId[],
                          metadataBySeriesId: TBySeriesId<SeriesMetadata>,
                          xDomain: Range,
                          chartPixelWidth: number,
                          currentData: TBySeriesId<SeriesData>) => TBySeriesId<Promise<SeriesData>>;
