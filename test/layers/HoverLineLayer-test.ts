import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';
import { expect } from 'chai';

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

  function renderWithSpy(spy: CanvasRenderingContext2D, hover?: number) {
    _renderCanvas(_.defaults({ hover }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should do nothing if no hover value is provided', () => {
    renderWithSpy(spy, undefined);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should do nothing if the hover value is NaN', () => {
    renderWithSpy(spy, NaN);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should do nothing if the hover value is infinite', () => {
    renderWithSpy(spy, Infinity);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should do nothing if the hover value is before the X domain', () => {
    renderWithSpy(spy, -100);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should do nothing if the hover value is after the X domain', () => {
    renderWithSpy(spy, 200);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should render a hover line for a hover value in bounds', () => {
    renderWithSpy(spy, 50);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [ 50, 0 ]),
      method('lineTo', [ 50, 100 ])
    ]);
  });

  it('should round the hover value to the integer', () => {
    renderWithSpy(spy, 33.4);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [ 33, 0 ]),
      method('lineTo', [ 33, 100 ])
    ]);
  });
});
