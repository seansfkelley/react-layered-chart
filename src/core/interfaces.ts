import * as React from 'react';

export type Color = string;
export type ScaleFunction = Function; // TODO: d3 scale function typings.
export type SeriesData = any[];

export type Ticks = ((axisDomain: Range) => number[]) | number[] | number;
export type TickFormat = ((value: number) => string) | string;
export type BooleanMouseEventHandler = (event: React.MouseEvent) => boolean;

export interface Range {
  min: number;
  max: number;
}

export interface SpanDatum {
  span: Range;
  value: number;
}

export interface TimestampDatum {
  timestamp: number;
  value: number;
}

export interface TimeBucketDatum {
  startTime: number;
  endTime: number;
  minValue: number;
  maxValue: number;
  firstValue: number;
  lastValue: number;
}
