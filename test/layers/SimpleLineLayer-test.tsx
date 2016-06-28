import * as React from 'react';
import * as d3Scale from 'd3-scale';
import CanvasContextSpy from '../CanvasContextSpy';
import { _renderCanvas, Props } from '../../src/core/layers/SimpleLineLayer';

describe('SimpleLineLayer', () => {
  let spy: typeof CanvasContextSpy;

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  it('should render all visible data plus one on each end when the data spans more than the domain', () => {

  });

  it('should render all the data if all the data fits in the domain', () => {
    _renderCanvas({
      data: [
        { xValue: 5, yValue: 33 },
        { xValue: 10, yValue: 50 }
      ],
      xDomain: { min: 0, max: 100 },
      yDomain: { min: 0, max: 100 },
      yScale: d3Scale.scaleLinear,
      color: '#000'
    }, 100, 100, spy);

    spy.operations.should.deepEqual([
      { method: 'beginPath', arguments: [] },
      { method: 'moveTo', arguments: [ 5, 67 ] },
      { method: 'lineTo', arguments: [ 10, 50 ] },
      { property: 'strokeStyle', value: '#000' },
      { method: 'stroke', arguments: [] }
    ]);
  });
});
