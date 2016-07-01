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

  it('should render a single rect for a single bucket', () => {
    renderWithSpy(spy, [
      bucket(40, 67, 45, 55, 0, 0)
    ]);

    spy.calls.slice(0, 3).should.deepEqual([
      method('beginPath', []),
      method('rect', [ 40, 45, 27, 10 ]),
      method('fill', []),
    ]);
  });

  it('should round min-X up and max-X down to the nearest integer', () => {
    renderWithSpy(spy, [
      bucket(10.4, 40.6, 45, 55, 0, 0)
    ]);

    spy.calls.slice(0, 3).should.deepEqual([
      method('beginPath', []),
      method('rect', [ 11, 45, 29, 10 ]),
      method('fill', [])
    ]);
  });

  it('should round min-Y and max-Y values down to the nearest integer', () => {
    renderWithSpy(spy, [
      bucket(10, 40, 40.4, 60.6, 0, 0)
    ]);

    spy.calls.slice(0, 3).should.deepEqual([
      method('beginPath', []),
      method('rect', [ 10, 40, 30, 20 ]),
      method('fill', [])
    ]);
  });

  it('should not draw rects for buckets that end up with height 1 after rounding', () => {
    renderWithSpy(spy, [
      bucket(10, 40, 50, 50, 0, 0)
    ]);

    spy.calls.slice(0, 2).should.deepEqual([
      method('beginPath', []),
      method('fill', [])
    ]);
  });

  /*
  it('should not draw rects for buckets that end up with width 1 after rounding', () => {
    renderWithSpy(spy, [
      bucket(50, 50, 10, 40, 0, 0)
    ]);

    spy.calls.slice(0, 2).should.deepEqual([
      method('beginPath', []),
      method('fill', [])
    ]);
  });
  */

  it('should not draw lines between rects when they overlap in Y and they are separated by 0 along X');

  it('should not draw lines between rects when they overlap in Y and they are separated by 1 along X');

  it('should draw lines between rects when they don't overlap in Y and they are separated by 0 along X');

  it('should draw lines between rects when they don't overlap in Y and they are separated by 1 along X');

  it('should always compute a width of at least 1, even for tiny buckets', () => {
    renderWithSpy(spy, [

    ]);

    spy.calls.should.deepEqual([

    ]);
  });

  /*
  it('should round first-Y and last-Y values down to the nearest integer', () => {
    renderWithSpy(spy, [
      bucket(10, 40, 40, 60, 45.6, 55.6)
    ]);

    spy.calls.slice(0, 3).should.deepEqual([
      method('beginPath', []),
      method('rect', [ 10, 40, 30, 20 ]),
      method('fill', [])
    ]);
  });
  */
});
