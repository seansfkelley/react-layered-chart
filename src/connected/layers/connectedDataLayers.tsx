import {
  Color,
  ScaleFunction,
  BarLayer,
  BarLayerProps,
  BucketedLineLayer,
  BucketedLineLayerProps,
  PointLayer,
  PointLayerProps,
  LineLayer,
  LineLayerProps,
  JoinType
} from '../../core';

import { wrapDataLayerWithConnect, SeriesIdProp } from './wrapDataLayerWithConnect';


// tslint:disable-next-line:class-name
export interface _CommonConnectedBarLayerProps {
  color?: Color;
}
export type ConnectedBarLayerProps = _CommonConnectedBarLayerProps & SeriesIdProp;
export const ConnectedBarLayer = wrapDataLayerWithConnect<_CommonConnectedBarLayerProps, BarLayerProps>(BarLayer);


// tslint:disable-next-line:class-name
export interface _CommonConnectedBucketedLineLayerProps {
  yScale?: ScaleFunction;
  color?: Color;
  joinType?: JoinType;
}
export type ConnectedBucketedLineLayerProps = _CommonConnectedBucketedLineLayerProps & SeriesIdProp;
export const ConnectedBucketedLineLayer = wrapDataLayerWithConnect<_CommonConnectedBucketedLineLayerProps, BucketedLineLayerProps>(BucketedLineLayer);


// tslint:disable-next-line:class-name
export interface _CommonConnectedPointLayerProps {
  yScale?: ScaleFunction;
  color?: Color;
  radius?: number;
  innerRadius?: number;
}
export type ConnectedPointLayerProps = _CommonConnectedPointLayerProps & SeriesIdProp;
export const ConnectedPointLayer = wrapDataLayerWithConnect<_CommonConnectedPointLayerProps, PointLayerProps>(PointLayer);


// tslint:disable-next-line:class-name
export interface _CommonConnectedLineLayerProps {
  yScale?: ScaleFunction;
  color?: Color;
  joinType?: JoinType;
}
export type ConnectedLineLayerProps = _CommonConnectedLineLayerProps & SeriesIdProp;
export const ConnectedLineLayer = wrapDataLayerWithConnect<_CommonConnectedLineLayerProps, LineLayerProps>(LineLayer);
