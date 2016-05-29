import {
  Color,
  ScaleFunction,
  BucketedLineLayer,
  BucketedLineLayerProps
} from '../../core';
import { SeriesId } from '../interfaces';

import wrapLayerWithConnect, { SeriesIdProp } from './wrapLayerWithConnect';

export interface OwnProps {
  yScale?: ScaleFunction;
  color?: Color;
}

export default wrapLayerWithConnect<OwnProps, BucketedLineLayerProps>(BucketedLineLayer);
