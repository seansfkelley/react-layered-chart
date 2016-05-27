export type Color = string;
export type ScaleFunction = Function; // TODO: d3 scale function typings.
export type SeriesData = any[];

export interface Range {
  min: number;
  max: number;
}

export interface TimeSpanDatum {
  timeSpan: Range;
  value: number;
}
