import * as React from 'react';

export type Color = string;
export type ScaleFunction = Function; // TODO: d3 scale function typings.
export type SeriesData = any[];

export type Ticks = ((axisDomain: Interval) => number[] | number) | number[] | number;
export type TickFormat = ((value: number) => string) | string;
export type BooleanMouseEventHandler = (event: React.MouseEvent<HTMLElement>) => boolean;

export interface Interval {
  min: number;
  max: number;
}

export interface PointDatum {
  xValue: number;
  yValue: number;
}

export interface SpanDatum {
  minXValue: number;
  maxXValue: number;
}

export interface BarDatum {
  minXValue: number;
  maxXValue: number;
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

export interface AxisSpec {
  scale?: ScaleFunction;
  ticks?: Ticks;
  tickFormat?: TickFormat;
  color?: Color;
}

export enum JoinType {
  DIRECT,
  LEADING,
  TRAILING
}
