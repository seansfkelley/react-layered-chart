import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { method, property, xSpan } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { XSpanDatum } from '../../src/core/interfaces';
import { _renderCanvas, Props } from '../../src/core/layers/SpanLayer';

describe('SpanLayer', () => {
  let spy: typeof CanvasContextSpy;

  const DEFAULT_PROPS = {
    xDomain: { min: 0, max: 100 },
    fillColor: '#000',
    borderColor: '#fff'
  };

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  function renderWithSpy(spy: CanvasRenderingContext2D, data: XSpanDatum[]) {
    _renderCanvas(_.defaults({ data }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should render a rect that hides its top and bottom borders just out of view', () => {
    renderWithSpy(spy, [
      xSpan(25, 75)
    ]);

    spy.callsOnly('rect').should.deepEqual([
      method('rect', [ 25, -1, 50, 102 ])
    ]);
  });

  it('should render span using the top-level default colors', () => {
    renderWithSpy(spy, [
      xSpan(25, 75)
    ]);

    spy.operations.should.deepEqual([
      property('lineWidth', 1),
      property('strokeStyle', '#fff'),
      method('beginPath', []),
      method('rect', [ 25, -1, 50, 102 ]),
      property('fillStyle', '#000'),
      method('fill', []),
      method('stroke', [])
    ]);
  });

  it('should render a span using its specified overridden colors', () => {
    renderWithSpy(spy, [
      xSpan(25, 75, '#333')
    ]);

    spy.operations.should.deepEqual([
      property('lineWidth', 1),
      property('strokeStyle', '#fff'),
      method('beginPath', []),
      method('rect', [ 25, -1, 50, 102 ]),
      property('fillStyle', '#333'),
      method('fill', []),
      method('stroke', [])
    ]);
  });

  it('should stroke/fill each span individually', () => {
    renderWithSpy(spy, [
      xSpan(10, 20),
      xSpan(80, 90)
    ]);

    spy.callsOnly('rect', 'fill', 'stroke').should.deepEqual([
      method('rect', [ 10, -1, 10, 102 ]),
      method('fill', []),
      method('stroke', []),

      method('rect', [ 80, -1, 10, 102 ]),
      method('fill', []),
      method('stroke', [])
    ]);
  });

  it('should round X values to the nearest integer', () => {
    renderWithSpy(spy, [
      xSpan(33.4, 84.6)
    ]);

    spy.callsOnly('rect').should.deepEqual([
      method('rect', [ 33, -1, 52, 102 ])
    ]);
  });

  it('should attempt to render spans even if their X values are NaN or infinite', () => {
    renderWithSpy(spy, [
      xSpan(NaN, 50),
      xSpan(50, NaN),
      xSpan(-Infinity, 50),
      xSpan(50, Infinity)
    ]);

    spy.callsOnly('rect').should.deepEqual([
      method('rect', [ NaN, -1, NaN, 102 ]),
      method('rect', [ 50, -1, NaN, 102 ]),
      method('rect', [ -Infinity, -1, Infinity, 102 ]),
      method('rect', [ 50, -1, Infinity, 102 ])
    ]);
  });
});
