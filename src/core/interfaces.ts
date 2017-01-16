import * as React from 'react';

// See http://stackoverflow.com/q/41668764/3736239 for more on why this new, simpler type exists.
interface D3NumericScaleSubset {
  (value: number): number;
  domain: (domain: [ number, number ]) => this;
  range: (range: [ number, number ]) => this;
  rangeRound: (range: [ number, number ]) => this;
}

export type Color = string;
export type ScaleFunction = () => D3NumericScaleSubset;
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
