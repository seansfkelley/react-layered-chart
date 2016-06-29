import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { method, property } from './layerTestUtils';
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

  it('should render a rect that hides its top and bottom borders just out of view', () => {
    renderWithSpy(spy, [
      span(25, 75)
    ], null, null);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ 25, -1, 50, 102 ])
    ]);
  });

  it('should render span using the top-level default colors', () => {
    renderWithSpy(spy, [
      span(25, 75)
    ]);

    spy.operations.should.deepEqual([
      property('lineWidth', 1),
      method('beginPath', []),
      method('rect', [ 25, -1, 50, 102 ]),
      property('fillStyle', '#000'),
      method('fill', []),
      property('strokeStyle', '#fff'),
      method('stroke', [])
    ]);
  });

  it('should render a span using its specified overridden colors', () => {
    renderWithSpy(spy, [
      span(25, 75, '#333', '#666')
    ]);

    spy.operations.should.deepEqual([
      property('lineWidth', 1),
      method('beginPath', []),
      method('rect', [ 25, -1, 50, 102 ]),
      property('fillStyle', '#333'),
      method('fill', []),
      property('strokeStyle', '#666'),
      method('stroke', [])
    ]);
  });

  it('should not stroke a span if no border color is specified anywhere', () => {
    renderWithSpy(spy, [
      span(25, 75)
    ], '#000', null);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ 25, -1, 50, 102 ]),
      method('fill', [])
    ]);
  });

  it('should not fill a span if no fill color is specified anywhere', () => {
    renderWithSpy(spy, [
      span(25, 75)
    ], null);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ 25, -1, 50, 102 ]),
      method('stroke', [])
    ]);
  });

  it('should stroke/fill each span individually', () => {
    renderWithSpy(spy, [
      span(10, 20),
      span(80, 90)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ 10, -1, 10, 102 ]),
      method('fill', []),
      method('stroke', []),

      method('beginPath', []),
      method('rect', [ 80, -1, 10, 102 ]),
      method('fill', []),
      method('stroke', [])
    ]);
  });

  it('should round X values to the nearest integer', () => {
    renderWithSpy(spy, [
      span(33.4, 84.6)
    ], null, null);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ 33, -1, 52, 102 ])
    ]);
  });

  it('should attempt to render spans even if their X values are NaN or infinite', () => {
    renderWithSpy(spy, [
      span(NaN, 50),
      span(50, NaN),
      span(-Infinity, 50),
      span(50, Infinity)
    ], null, null);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ NaN, -1, NaN, 102 ]),
      method('beginPath', []),
      method('rect', [ 50, -1, NaN, 102 ]),
      method('beginPath', []),
      method('rect', [ -Infinity, -1, Infinity, 102 ]),
      method('beginPath', []),
      method('rect', [ 50, -1, Infinity, 102 ])
    ]);
  });
});
