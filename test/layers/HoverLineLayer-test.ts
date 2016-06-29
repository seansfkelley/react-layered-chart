import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { method } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { _renderCanvas, Props } from '../../src/core/layers/HoverLineLayer';

describe('HoverLineLayer', () => {
  let spy: typeof CanvasContextSpy;

  const DEFAULT_PROPS = {
    xDomain: { min: 0, max: 100 },
    stroke: '#000'
  };

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  function renderWithSpy(spy: typeof CanvasContextSpy, hover: number) {
    _renderCanvas(_.defaults({ hover }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should do nothing if no hover value is provided', () => {
    renderWithSpy(spy, null);

    spy.operations.should.deepEqual([]);
  });

  it('should do nothing if the hover value is NaN', () => {
    renderWithSpy(spy, NaN);

    spy.operations.should.deepEqual([]);
  });

  it('should do nothing if the hover value is infinite', () => {
    renderWithSpy(spy, Infinity);

    spy.operations.should.deepEqual([]);
  });

  it('should do nothing if the hover value is before the X domain', () => {
    renderWithSpy(spy, -100);

    spy.operations.should.deepEqual([]);
  });

  it('should do nothing if the hover value is after the X domain', () => {
    renderWithSpy(spy, 200);

    spy.operations.should.deepEqual([]);
  });

  it('should render a hover line for a hover value in bounds', () => {
    renderWithSpy(spy, 50);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 50, 0 ]),
      method('lineTo', [ 50, 100 ]),
      method('stroke', [])
    ]);
  });

  it('should round the hover value to the integer', () => {
    renderWithSpy(spy, 33.4);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 33, 0 ]),
      method('lineTo', [ 33, 100 ]),
      method('stroke', [])
    ]);
  });
});
