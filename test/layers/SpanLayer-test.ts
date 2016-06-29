import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { point, method, property } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { PointDatum } from '../../src/core/interfaces';
import { _renderCanvas, Props, ColoredSpanDatum } from '../../src/core/layers/SpanLayer';

function span(minXValue: number, maxXValue: number, fillColor?: string, borderColor?: string): ColoredSpanDatum {
  return { minXValue, maxXValue, fillColor, borderColor };
}

describe('SpanLayer', () => {
  let spy: typeof CanvasContextSpy;

  const DEFAULT_PROPS = {
    xDomain: { min: 0, max: 100 }
  };

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  function renderWithSpy(spy: typeof CanvasContextSpy, data: ColoredSpanDatum[], fillColor: string = '#000', borderColor: string = '#fff') {
    _renderCanvas(_.defaults({ data, fillColor, borderColor }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should render a rect that hides its top and bottom borders just out of view');

  it('should render span using the top-level default colors');

  it('should render a span using its specified overridden colors');

  it('should not stroke a span if no border color is specified anywhere');

  it('should not fill a span if no fill color is specified anywhere');

  it('should not call stroke or fill if there is no default and the span does not specify values for them');

  it('should stroke/fill each span individually');

  it('should round X values to the nearest integer');

  it('should attempt to render spans even if their X values are NaN or infinite');
});
