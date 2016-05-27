export type Color = string;

export type SeriesData = any[];

export interface Range {
  min: number;
  max: number;
}

export interface TimeSpanDatum {
  timeSpan: Range;
  value: number;
}
