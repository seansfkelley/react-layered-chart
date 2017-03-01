import * as _ from 'lodash';
import { expect } from 'chai';

import { method, property, span } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { SpanDatum } from '../../src/core/interfaces';
import { _renderCanvas } from '../../src/core/layers/SpanLayer';

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

  function renderWithSpy(spy: CanvasRenderingContext2D, data: SpanDatum[]) {
    _renderCanvas(_.defaults({ data }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should render a rect that hides its top and bottom borders just out of view', () => {
    renderWithSpy(spy, [
      span(25, 75)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([
      method('rect', [ 25, -1, 50, 102 ])
    ]);
  });

  it('should render span using the top-level default colors', () => {
    renderWithSpy(spy, [
      span(25, 75)
    ]);

    expect(spy.operations).to.deep.equal([
      property('lineWidth', 1),
      property('strokeStyle', '#fff'),
      method('beginPath', []),
      method('rect', [ 25, -1, 50, 102 ]),
      property('fillStyle', '#000'),
      method('fill', []),
      method('stroke', [])
    ]);
  });

  it('should stroke/fill each span individually', () => {
    renderWithSpy(spy, [
      span(10, 20),
      span(80, 90)
    ]);

    expect(spy.callsOnly('rect', 'fill', 'stroke')).to.deep.equal([
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
      span(33.4, 84.6)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([
      method('rect', [ 33, -1, 52, 102 ])
    ]);
  });

  it('should attempt to render spans even if their X values are NaN or infinite', () => {
    renderWithSpy(spy, [
      span(NaN, 50),
      span(50, NaN),
      span(-Infinity, 50),
      span(50, Infinity)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([
      method('rect', [ NaN, -1, NaN, 102 ]),
      method('rect', [ 50, -1, NaN, 102 ]),
      method('rect', [ -Infinity, -1, Infinity, 102 ]),
      method('rect', [ 50, -1, Infinity, 102 ])
    ]);
  });

  it('should render spans at least one pixel wide even if their X values are on the same pixel', () => {
    renderWithSpy(spy, [
      span(10, 10),
      span(30.02, 30.05)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([
      method('rect', [ 10, -1, 1, 102 ]),
      method('rect', [ 30, -1, 1, 102 ])
    ]);
  });
});
