import * as _ from 'lodash';
import { expect } from 'chai';

import { method } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { _renderCanvas } from '../../src/core/layers/VerticalLineLayer';

describe('VerticalLineLayer', () => {
  let spy: typeof CanvasContextSpy;

  const DEFAULT_PROPS = {
    xDomain: { min: 0, max: 100 },
    stroke: '#000'
  };

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  function renderWithSpy(spy: CanvasRenderingContext2D, xValue?: number) {
    _renderCanvas(_.defaults({ xValue }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should do nothing if no xValue is provided', () => {
    renderWithSpy(spy, undefined);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should do nothing if the xValue is NaN', () => {
    renderWithSpy(spy, NaN);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should do nothing if the xValue is infinite', () => {
    renderWithSpy(spy, Infinity);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should do nothing if the xValue is before the X domain', () => {
    renderWithSpy(spy, -100);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should do nothing if the xValue is after the X domain', () => {
    renderWithSpy(spy, 200);

    expect(spy.operations).to.deep.equal([]);
  });

  it('should render a value line for a xValue in bounds', () => {
    renderWithSpy(spy, 50);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [ 50, 0 ]),
      method('lineTo', [ 50, 100 ])
    ]);
  });

  it('should round the xValue to the integer', () => {
    renderWithSpy(spy, 33.4);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [ 33, 0 ]),
      method('lineTo', [ 33, 100 ])
    ]);
  });
});
