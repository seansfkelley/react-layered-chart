import {
  Color,
  ScaleFunction,
  BarLayer,
  BarLayerProps
} from '../../core';
import { SeriesId } from '../interfaces';

import wrapDataLayerWithConnect, { SeriesIdProp } from './wrapDataLayerWithConnect';

export interface OwnProps {
  color?: Color;
}

export default wrapDataLayerWithConnect<OwnProps, BarLayerProps>(BarLayer);
