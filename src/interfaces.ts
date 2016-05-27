export type Color = string;
export type ScaleFunction = Function; // TODO: d3 scale function typings.
export type SeriesData = any[];

export type Ticks = ((axisDomain: Range) => number[]) | number[] | number;
export type TickFormat = ((value: number) => string) | string;

export interface Range {
  min: number;
  max: number;
}

export interface TimeSpanDatum {
  timeSpan: Range;
  value: number;
}

export interface TimestampDatum {
  timestamp: number;
  value: number;
}
