import { expect } from 'chai';
import * as d3Scale from 'd3-scale';
import { Interval } from '../src/core/interfaces';
import {
  IndexBounds,
  getIndexBoundsForPointData,
  getIndexBoundsForSpanData,
  computeTicks
} from '../src/core/renderUtils';

describe('(render utils)', () => {
  describe('getIndexBoundsForPointData', () => {
    interface PointTestCase<T> {
      name: string;
      data: T[];
      interval: Interval;
      bounds: IndexBounds;
      stringAccessor: string;
      functionAccessor: (value: T) => number;
    }

    const TEST_CASES: PointTestCase<any>[] = [{
      name: 'should return a half-open interval for the slice of data in bounds, plus one extra on each side',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ],
      interval: {
        min: 3,
        max: 5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should return firstIndex === lastIndex === 0 when the data is empty',
      data: [],
      interval: {
        min: -Infinity,
        max: Infinity
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 0
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should return firstIndex === lastIndex === 0 when the bounds are completely before the data',
      data: [
        { timestamp: 0 }
      ],
      interval: {
        min: -2,
        max: -1
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 0
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should return firstIndex === lastIndex === length of data when the bounds are completely after the data',
      data: [
        { timestamp: 0 }
      ],
      interval: {
        min: 1,
        max: 2
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 1
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should accept arbitrarily deeply nested string accessors',
      data: [
        { outer: { middle: { inner: 0 } } },
        { outer: { middle: { inner: 2 } } },
        { outer: { middle: { inner: 4 } } },
        { outer: { middle: { inner: 6 } } },
        { outer: { middle: { inner: 8 } } }
      ],
      interval: {
        min: 3,
        max: 5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessor: 'outer.middle.inner',
      functionAccessor: (value: any) => value.outer.middle.inner
    }, {
      name: 'should return 0 for firstIndex when the min bound is before the earliest timestamp',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 }
      ],
      interval: {
        min: -1,
        max: 1
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 2
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should return the length of the input for lastIndex when the max bound is after the last datapoint',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 }
      ],
      interval: {
        min: 3,
        max: 5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 3
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should include a value that is equal to the min bound',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ],
      interval: {
        min: 2,
        max: 5
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 4
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should include a value that is equal to the max bound',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ],
      interval: {
        min: 3,
        max: 4
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should include a value that is equal to both bounds',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ],
      interval: {
        min: 4,
        max: 4
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should include all values at identical timestamps when they are within bounds',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ],
      interval: {
        min: 3,
        max: 5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 6
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should include all identical values that are equal to the min bound',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 2 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ],
      interval: {
        min: 2,
        max: 5
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 6
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should include all identical values that are equal to the max bound',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ],
      interval: {
        min: 3,
        max: 4
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 6
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }, {
      name: 'should include a value that is equal to both bounds',
      data: [
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ],
      interval: {
        min: 4,
        max: 4
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 6
      },
      stringAccessor: 'timestamp',
      functionAccessor: (value: any) => value.timestamp
    }];

    describe('with string accessor', () => {
      TEST_CASES.forEach(testCase => {
        it(testCase.name, () => {
          expect(getIndexBoundsForPointData(testCase.data, testCase.interval, testCase.stringAccessor)).to.deep.equal(testCase.bounds);
        });
      });
    });

    describe('with function accessor', () => {
      TEST_CASES.forEach(testCase => {
        it(testCase.name, () => {
          expect(getIndexBoundsForPointData(testCase.data, testCase.interval, testCase.functionAccessor)).to.deep.equal(testCase.bounds);
        });
      });
    });
  });

  describe('getIndexBoundsForSpanData', () => {
    interface SpanTestCase<T> {
      name: string;
      data: T[];
      interval: Interval;
      bounds: IndexBounds;
      stringAccessorMin: string;
      stringAccessorMax: string;
      functionAccessorMin: (value: T) => number;
      functionAccessorMax: (value: T) => number;
    }

    const TEST_CASES: SpanTestCase<any>[] = [{
      name: 'should return a half-open interval for the slice of data in bounds, plus one extra on each side',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 3.5,
        max: 5.5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should return firstIndex === lastIndex === 0 when the data is empty',
      data: [],
      interval: {
        min: -Infinity,
        max: Infinity
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 0
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should return firstIndex === lastIndex === 0 when the bounds are completely before the data',
      data: [
        { min: 0, max: 1 }
      ],
      interval: {
        min: -2,
        max: -1
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 0
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should return firstIndex === lastIndex === length of data when the bounds are completely after the data',
      data: [
        { min: 0, max: 1 }
      ],
      interval: {
        min: 2,
        max: 3
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 1
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should accept arbitrarily deeply nested string accessors',
      data: [
        { outer: { inner: { min: 0, max: 1 } } },
        { outer: { inner: { min: 2, max: 3 } } },
        { outer: { inner: { min: 4, max: 5 } } },
        { outer: { inner: { min: 6, max: 7 } } },
        { outer: { inner: { min: 8, max: 9 } } }
      ],
      interval: {
        min: 3.5,
        max: 5.5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessorMin: 'outer.inner.min',
      stringAccessorMax: 'outer.inner.max',
      functionAccessorMin: (value: any) => value.outer.inner.min,
      functionAccessorMax: (value: any) => value.outer.inner.max,
    }, {
      name: 'should return 0 for firstIndex when the min bound is strictly before the earliest timestamp',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 }
      ],
      interval: {
        min: -2,
        max: 1.5
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 2
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should return the length of the input for lastIndex when the max bound is strictly after the last datapoint',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 }
      ],
      interval: {
        min: 3.5,
        max: 5.5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 3
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include values that span across the min bound',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 4.5,
        max: 5.5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include values that span across the max bound',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 3.5,
        max: 4.5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include values whose min is equal to the min bound',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 4,
        max: 5.5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include values whose max is equal to the max bound',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 3.5,
        max: 5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include values whose max is equal to the min bound',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 5,
        max: 5.5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include values whose min is equal to the max bound',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 3.5,
        max: 4
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 4
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include a value that is strictly larger than the bounds',
      data: [
        { min: 0, max: 9 },
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 3.5,
        max: 5.5
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 5
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include multiple values that are all larger than the bounds',
      data: [
        { min: 0, max: 9 },
        { min: 1, max: 8 },
        { min: 2, max: 7 },
        { min: 3, max: 6 },
        { min: 4, max: 5 }
      ],
      interval: {
        min: 4.25,
        max: 4.75
      },
      bounds: {
        firstIndex: 0,
        lastIndex: 5
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include a value that is equal to the bounds',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 3.5, max: 4 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 3.5,
        max: 5.5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 5
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }, {
      name: 'should include all values at identical timestamps when they are within bounds',
      data: [
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 4, max: 5 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ],
      interval: {
        min: 3.5,
        max: 5.5
      },
      bounds: {
        firstIndex: 1,
        lastIndex: 6
      },
      stringAccessorMin: 'min',
      stringAccessorMax: 'max',
      functionAccessorMin: (value: any) => value.min,
      functionAccessorMax: (value: any) => value.max,
    }];

    describe('with string accessor', () => {
      TEST_CASES.forEach(testCase => {
        it(testCase.name, () => {
          expect(getIndexBoundsForSpanData(testCase.data, testCase.interval, testCase.stringAccessorMin, testCase.stringAccessorMax)).to.deep.equal(testCase.bounds);
        });
      });
    });

    describe('with function accessor', () => {
      TEST_CASES.forEach(testCase => {
        it(testCase.name, () => {
          expect(getIndexBoundsForSpanData(testCase.data, testCase.interval, testCase.functionAccessorMin, testCase.functionAccessorMax)).to.deep.equal(testCase.bounds);
        });
      });
    });
  });

  describe('computeTicks', () => {
    const scale = d3Scale.scaleLinear()
      .domain([0, 1])
      .range([0, 1]);

    it('should return an array of numbers and a function when only the scale is passed', () => {
      const { ticks, format } = computeTicks(scale);
      expect(ticks).to.be.an('array');
      expect(format).to.be.a('function');
    });

    it('should return an array of numbers when given a number for ticks', () => {
      expect(computeTicks(scale, 5).ticks).to.be.an('array');
    });

    it('should return an array of numbers as-is when given an array for ticks', () => {
      const ticks = [ 1, 2, 3 ];
      expect(computeTicks(scale, ticks).ticks).to.equal(ticks);
    });

    it('should return an array of numbers when given a function that returns an array of numbers', () => {
      const ticks = [ 1, 2, 3 ];
      const fn = function() { return ticks; } as any;
      expect(computeTicks(scale, fn).ticks).to.equal(ticks);
    });

    it('should return an array of numbers when given a function that returns a number', () => {
      const fn = function() { return 5; } as any;
      expect(computeTicks(scale, fn).ticks).to.be.an('array');
    });

    it('should return the format function as-is when passed', () => {
      const fn = function(){} as any;
      expect(computeTicks(scale, undefined, fn).format).to.equal(fn);
    });
  });
});
