import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { bucket, method } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { BucketDatum } from '../../src/core/interfaces';
import { _renderCanvas, Props } from '../../src/core/layers/BucketedLineLayer';

describe('BucketedLineLayer', () => {
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

  function renderWithSpy(spy: typeof CanvasContextSpy, data: BucketDatum[]) {
    _renderCanvas(_.defaults({ data }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should not render anything if there is only one data point', () => {
    renderWithSpy(spy, [
      bucket(40, 60, 40, 60, 45, 55)
    ]);

    spy.calls.should.deepEqual([]);
  });

  it('should round min-X up and max-X down to the nearest integer', () => {
    renderWithSpy(spy, [

    ]);

    spy.calls.should.deepEqual([

    ]);
  });

  it('should round all Y values down to the nearest integer', () => {
    renderWithSpy(spy, [

    ]);

    spy.calls.should.deepEqual([

    ]);
  });

  it('should draw rects for each bucket, connected by non-overlapping lines', () => {
    renderWithSpy(spy, [

    ]);

    spy.calls.should.deepEqual([

    ]);
  });

  it('should not draw rects for buckets that end up with height 1 after rounding', () => {
    renderWithSpy(spy, [

    ]);

    spy.calls.should.deepEqual([

    ]);
  });

  it('should not draw rects for buckets that end up with width 1 after rounding', () => {
    renderWithSpy(spy, [

    ]);

    spy.calls.should.deepEqual([

    ]);
  });

  it('should not draw lines for buckets that are edge-to-edge', () => {
    renderWithSpy(spy, [

    ]);

    spy.calls.should.deepEqual([

    ]);
  });

  it('should always compute a width of at least 1, even for tiny buckets', () => {
    renderWithSpy(spy, [

    ]);

    spy.calls.should.deepEqual([

    ]);
  });
});
