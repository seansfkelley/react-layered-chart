import {
  Color,
  ScaleFunction,
  BucketedLineLayer,
  BucketedLineLayerProps
} from '../../core';
import { SeriesId } from '../interfaces';

import wrapDataLayerWithConnect, { SeriesIdProp } from './wrapDataLayerWithConnect';

export interface OwnProps {
  yScale?: ScaleFunction;
  color?: Color;
}

export default wrapDataLayerWithConnect<OwnProps, BucketedLineLayerProps>(BucketedLineLayer);
