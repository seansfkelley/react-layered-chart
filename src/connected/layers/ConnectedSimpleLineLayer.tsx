import {
  Color,
  ScaleFunction,
  SimpleLineLayer,
  SimpleLineLayerProps
} from '../../core';
import { SeriesId } from '../interfaces';

import wrapDataLayerWithConnect, { SeriesIdProp } from './wrapDataLayerWithConnect';

export interface OwnProps {
  yScale?: ScaleFunction;
  color?: Color;
}

export default wrapDataLayerWithConnect<OwnProps, SimpleLineLayerProps>(SimpleLineLayer);
