import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { span, method } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { SpanDatum } from '../../src/core/interfaces';
import { _renderCanvas, Props } from '../../src/core/layers/BarLayer';

describe('BarLayer', () => {
  let spy: typeof CanvasContextSpy;

  const DEFAULT_PROPS = {
    xDomain: { min: 0, max: 100 },
    yDomain: { min: 0, max: 100 },
    color: '#000'
  };

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  function renderWithSpy(spy: typeof CanvasContextSpy, data: SpanDatum[]) {
    _renderCanvas(_.defaults({ data }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should render a bar with a positive value');

  it('should render a bar with a negative value');
});
