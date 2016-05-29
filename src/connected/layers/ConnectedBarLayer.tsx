import {
  Color,
  ScaleFunction,
  BarLayer,
  BarLayerProps
} from '../../core';
import { SeriesId } from '../interfaces';

import wrapLayerWithConnect, { SeriesIdProp } from './wrapLayerWithConnect';

export interface OwnProps {
  color?: Color;
}

export default wrapLayerWithConnect<OwnProps, BarLayerProps>(BarLayer);
