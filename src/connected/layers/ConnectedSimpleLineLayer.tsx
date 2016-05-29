import {
  Color,
  ScaleFunction,
  SimpleLineLayer,
  SimpleLineLayerProps
} from '../../core';
import { SeriesId } from '../interfaces';

import wrapLayerWithConnect from './wrapLayerWithConnect';

export interface OwnProps {
  yScale?: ScaleFunction;
  color?: Color;
}

export default wrapLayerWithConnect<OwnProps, SimpleLineLayerProps>(SimpleLineLayer);
