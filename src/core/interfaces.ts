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
  xMinValue: number;
  xMaxValue: number;
  yValue: number;
}

export interface PointDatum {
  xValue: number;
  yValue: number;
}

export interface BucketDatum {
  minXValue: number;
  maxXValue: number;
  minYValue: number;
  maxYValue: number;
  firstYValue: number;
  lastYValue: number;
}
