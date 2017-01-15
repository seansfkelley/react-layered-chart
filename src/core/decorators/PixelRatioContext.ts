import * as _ from 'lodash';
import * as React from 'react';

export interface Context {
  pixelRatio: number;
}

export default function PixelRatioContext(component: React.ComponentClass<any>) {
  component.contextTypes = _.defaults({
    pixelRatio: React.PropTypes.number
  }, component.contextTypes);
}
