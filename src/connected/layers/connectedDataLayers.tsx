import {
  Color,
  ScaleFunction,
  BarLayer,
  BarLayerProps,
  BucketedLineLayer,
  BucketedLineLayerProps,
  PointLayer,
  PointLayerProps,
  SimpleLineLayer,
  SimpleLineLayerProps
} from '../../core';
import { SeriesId } from '../interfaces';

import wrapDataLayerWithConnect, { SeriesIdProp } from './wrapDataLayerWithConnect';

export interface ConnectedBarLayerProps {
  color?: Color;
}

export const ConnectedBarLayer = wrapDataLayerWithConnect<ConnectedBarLayerProps, BarLayerProps>(BarLayer);

export interface ConnectedBucketedLineLayerProps {
  yScale?: ScaleFunction;
  color?: Color;
}

export const ConnectedBucketedLineLayer = wrapDataLayerWithConnect<ConnectedBucketedLineLayerProps, BucketedLineLayerProps>(BucketedLineLayer);

export interface ConnectedPointLayerProps {
  yScale?: ScaleFunction;
  color?: Color;
  radius?: number;
  innerRadius?: number;
}

export const ConnectedPointLayer = wrapDataLayerWithConnect<ConnectedPointLayerProps, PointLayerProps>(PointLayer);

export interface ConnectedSimpleLineLayerProps {
  yScale?: ScaleFunction;
  color?: Color;
}

export const ConnectedSimpleLineLayer = wrapDataLayerWithConnect<ConnectedSimpleLineLayerProps, SimpleLineLayerProps>(SimpleLineLayer);
