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
      bucket(10, 25, 35, 80, 0, 0)
    ]);

    spy.calls.slice(0, 3).should.deepEqual([
      method('beginPath', []),
      method('rect', [ 10, 20, 15, 45 ]),
      method('fill', []),
    ]);
  });

  it('should round min-X up and max-X down to the nearest integer', () => {
    renderWithSpy(spy, [
      bucket(10.4, 40.6, 0, 100, 0, 0)
    ]);

    spy.calls.slice(0, 3).should.deepEqual([
      method('beginPath', []),
      method('rect', [ 11, 0, 29, 100 ]),
      method('fill', [])
    ]);
  });

  it('should round min-Y and max-Y values down to the nearest integer', () => {
    renderWithSpy(spy, [
      bucket(0, 100, 40.4, 60.6, 0, 0)
    ]);

    spy.calls.slice(0, 3).should.deepEqual([
      method('beginPath', []),
      method('rect', [ 0, 40, 100, 20 ]),
      method('fill', [])
    ]);
  });

  it('should not draw rects for buckets that end up with height 1 after rounding', () => {
    renderWithSpy(spy, [
      bucket(0, 100, 50, 50, 0, 0)
    ]);

    spy.calls.slice(0, 2).should.deepEqual([
      method('beginPath', []),
      method('fill', [])
    ]);
  });

  xit('should not draw rects for buckets that end up with width 1 after rounding', () => {
    renderWithSpy(spy, [
      bucket(50, 50, 0, 100, 0, 0)
    ]);

    spy.calls.slice(0, 2).should.deepEqual([
      method('beginPath', []),
      method('fill', [])
    ]);
  });

  it('should draw lines between the last and first (respectively) Y values of adjacent rects', () => {
    renderWithSpy(spy, [
      bucket( 0,  40, 0, 100,  0, 67),
      bucket(60, 100, 0, 100, 45,  0)
    ]);

    spy.calls.slice(4).should.deepEqual([
      method('beginPath', []),
      method('moveTo', [  40,  33 ]),
      method('lineTo', [  60,  55 ]),
      method('moveTo', [ 100, 100 ]),
      method('stroke', [])
    ]);
  });

  it('should round first-Y and last-Y values down to the nearest integer', () => {
    renderWithSpy(spy, [
      bucket( 0,  40, 0, 100,    0, 67.6),
      bucket(60, 100, 0, 100, 45.6,    0)
    ]);

    spy.calls.slice(4).should.deepEqual([
      method('beginPath', []),
      method('moveTo', [  40,  33 ]),
      method('lineTo', [  60,  55 ]),
      method('moveTo', [ 100, 100 ]),
      method('stroke', [])
    ]);
  });

  xit('should not draw lines between rects when they overlap in Y and they are separated by 0 along X', () => {
    renderWithSpy(spy, [
      bucket( 0,  50,  0,  60,  0,  60),
      bucket(50, 100, 40, 100, 40, 100)
    ]);

    spy.calls.slice(4).should.deepEqual([
      method('beginPath', []),
      method('moveTo', [  50, 40 ]),
      method('moveTo', [ 100,  0 ]),
      method('stroke', [])
    ]);
  });

  xit('should not draw lines between rects when they overlap in Y and they are separated by 1 along X', () => {
    renderWithSpy(spy, [
      bucket( 0,  50,  0,  60,  0,  60),
      bucket(51, 100, 40, 100, 40, 100)
    ]);

    spy.calls.slice(4).should.deepEqual([
      method('beginPath', []),
      method('moveTo', [  50, 40 ]),
      method('moveTo', [ 100,  0 ]),
      method('stroke', [])
    ]);
  });

  xit('should draw lines between rects when they do not overlap in Y and they are separated by 0 along X', () => {
    renderWithSpy(spy, [
      bucket( 0,  50,  0,  40,  0,  40),
      bucket(50, 100, 60, 100, 60, 100)
    ]);

    spy.calls.slice(4).should.deepEqual([
      method('beginPath', []),
      method('moveTo', [  50, 60 ]),
      method('lineTo', [  50, 40 ]),
      method('moveTo', [ 100,  0 ]),
      method('stroke', [])
    ]);
  });

  xit('should draw lines between rects when they do not overlap in Y and they are separated by 1 along X', () => {
    renderWithSpy(spy, [
      bucket( 0,  50,  0,  40,  0,  40),
      bucket(51, 100, 60, 100, 60, 100)
    ]);

    spy.calls.slice(4).should.deepEqual([
      method('beginPath', []),
      method('moveTo', [  50, 60 ]),
      method('lineTo', [  51, 40 ]),
      method('moveTo', [ 100,  0 ]),
      method('stroke', [])
    ]);
  });

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
