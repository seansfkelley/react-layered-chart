import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { point, method, property } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { PointDatum } from '../../src/core/interfaces';
import { _renderCanvas, Props } from '../../src/core/layers/PointLayer';

const TWO_PI = Math.PI * 2;

describe('PointLayer', () => {
  let spy: typeof CanvasContextSpy;

  const DEFAULT_PROPS = {
    xDomain: { min: 0, max: 100 },
    yDomain: { min: 0, max: 100 },
    yScale: d3Scale.scaleLinear,
    color: '#000'
  };

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  function renderWithSpy(spy: typeof CanvasContextSpy, data: PointDatum[], innerRadius: number = 0) {
    _renderCanvas(_.defaults({ data, innerRadius, radius: 5 }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should batch everything together with one fill when innerRadius = 0', () => {
    renderWithSpy(spy, [
      point(25, 33),
      point(75, 67)
    ], 0);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 25, 67 ]),
      method('arc', [ 25, 67, 5, 0, TWO_PI ]),
      method('moveTo', [ 75, 33 ]),
      method('arc', [ 75, 33, 5, 0, TWO_PI ]),
      method('fill', [])
    ]);
  });

  it('should set lineWidth once stroke each point individually when innerRadius > 0', () => {
    renderWithSpy(spy, [
      point(25, 33),
      point(75, 67)
    ], 3);

    spy.properties.filter(({ property }) => property === 'lineWidth').should.deepEqual([
      property('lineWidth', 2)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('arc', [ 25, 67, 4, 0, TWO_PI ]),
      method('stroke', []),

      method('beginPath', []),
      method('arc', [ 75, 33, 4, 0, TWO_PI ]),
      method('stroke', [])
    ]);
  });

  it('should render only the data that is in within the bounds of the X domain, +/- 1', () => {
    renderWithSpy(spy, [
      point(-100, 0),
      point(-50, 16),
      point(25, 33),
      point(75, 67),
      point(150, 95),
      point(200, 100)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ -50, 84 ]),
      method('arc', [ -50, 84, 5, 0, TWO_PI ]),
      method('moveTo', [ 25, 67 ]),
      method('arc', [ 25, 67, 5, 0, TWO_PI ]),
      method('moveTo', [ 75, 33 ]),
      method('arc', [ 75, 33, 5, 0, TWO_PI ]),
      method('moveTo', [ 150, 5 ]),
      method('arc', [ 150, 5, 5, 0, TWO_PI ]),
      method('fill', [])
    ]);
  });

  it('should round X and Y values to the nearest integer', () => {
    renderWithSpy(spy, [
      point(34.6, 22.1)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 35, 78 ]),
      method('arc', [ 35, 78, 5, 0, TWO_PI ]),
      method('fill', [])
    ]);
  });

  it('should attempt to render points even if their X or Y values are NaN or infinite', () => {
    renderWithSpy(spy, [
      point(50, Infinity),
      point(Infinity, 50),
      point(50, NaN),
      point(NaN, 50)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 50, -Infinity ]),
      method('arc', [ 50, -Infinity, 5, 0, TWO_PI ]),
      method('moveTo', [ Infinity, 50 ]),
      method('arc', [ Infinity, 50, 5, 0, TWO_PI ]),
      method('moveTo', [ 50, NaN ]),
      method('arc', [ 50, NaN, 5, 0, TWO_PI ]),
      method('moveTo', [ NaN, 50 ]),
      method('arc', [ NaN, 50, 5, 0, TWO_PI ]),
      method('fill', [])
    ]);
  });
});
