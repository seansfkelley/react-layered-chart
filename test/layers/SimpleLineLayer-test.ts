import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { point, method } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { PointDatum } from '../../src/core/interfaces';
import { _renderCanvas, Props } from '../../src/core/layers/SimpleLineLayer';

describe('SimpleLineLayer', () => {
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

  function renderWithSpy(spy: typeof CanvasContextSpy, data: PointDatum[]) {
    _renderCanvas(_.defaults({ data }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should not render anything if there is only one data point', () => {
    renderWithSpy(spy, [
      point(50, 50)
    ]);

    spy.calls.should.deepEqual([]);
  });

  it('should not render anything if all the data is entirely outside the X domain', () => {
    renderWithSpy(spy, [
      point(-100, 0),
      point(-50, 0)
    ]);

    spy.calls.should.deepEqual([]);
  });

  it('should render all the data if all the data fits in the X domain', () => {
    renderWithSpy(spy, [
      point(25, 33),
      point(75, 50)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 25, 67 ]),
      method('lineTo', [ 75, 50 ]),
      method('stroke', [])
    ]);
  });

  it('should render all visible data plus one on each end when the data spans more than the X domain', () => {
    renderWithSpy(spy, [
      point(-10, 5),
      point(-5, 10),
      point(50, 15),
      point(105, 20),
      point(110, 2)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ -5, 90 ]),
      method('lineTo', [ 50, 85 ]),
      method('lineTo', [ 105, 80 ]),
      method('stroke', [])
    ]);
  });

  it('should round X and Y values to the nearest integer', () => {
    renderWithSpy(spy, [
      point(34.6, 22.1),
      point(55.4, 84.6)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 35, 78 ]),
      method('lineTo', [ 55, 15 ]),
      method('stroke', [])
    ]);
  });

  it('should attempt to render points even if their X or Y values are NaN or infinite', () => {
    renderWithSpy(spy, [
      point(0, 50),
      point(50, Infinity),
      point(Infinity, 50),
      point(50, NaN),
      point(NaN, 50),
      point(100, 50)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 0, 50 ]),
      method('lineTo', [ 50, -Infinity ]),
      method('lineTo', [ Infinity, 50 ]),
      method('lineTo', [ 50, NaN ]),
      method('lineTo', [ NaN, 50 ]),
      method('lineTo', [ 100, 50 ]),
      method('stroke', [])
    ]);
  });
});
