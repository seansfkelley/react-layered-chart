import * as _ from 'lodash';
import * as should from 'should';

import { Interval } from '../src/core/interfaces';
import {
  enforceIntervalBounds,
  enforceIntervalExtent,
  extendInterval,
  roundInterval,
  mergeIntervals,
  rangeContains,
  panInterval,
  zoomInterval
} from '../src/core/intervalUtils';
import { TBySeriesId } from '../src/connected/interfaces';

function interval(min, max) {
  return { min, max };
}

describe('enforceIntervalBounds', () => {
  const BOUNDS = interval(0, 10);

  const TEST_CASES = [
    {
      description: 'should do nothing if the interval is within bounds',
      interval: interval(1, 9),
      output: interval(1, 9)
    }, {
      description: 'should slide the interval forward without changing extent if the interval is entirely before the early bound',
      interval: interval(-3, -1),
      output: interval(0, 2)
    }, {
      description: 'should slide the interval forward  without changing extent if the interval starts before the early bound',
      interval: interval(-1, 1),
      output: interval(0, 2)
    }, {
      description: 'should slide the interval back without changing extent if the interval ends after the later bound',
      interval: interval(9, 11),
      output: interval(8, 10)
    }, {
      description: 'should slide the interval back without changing extent if the interval is entirely after the later bound',
      interval: interval(11, 13),
      output: interval(8, 10)
    }, {
      description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and extends on both ends',
      interval: interval(-1, 13),
      output: interval(-2, 12)
    }, {
      description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and starts before',
      interval: interval(-10, 2),
      output: interval(-1, 11)
    }, {
      description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and is entirely before',
      interval: interval(-13, -1),
      output: interval(-1, 11)
    }, {
      description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and ends after',
      interval: interval(1, 13),
      output: interval(-1, 11)
    }, {
      description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and is entirely after',
      interval: interval(11, 23),
      output: interval(-1, 11)
    }
  ];

  TEST_CASES.forEach(test => {
    it(test.description, () => {
      enforceIntervalBounds(test.interval, BOUNDS).should.deepEqual(test.output);
    });
  });

  it('should not mutate the input interval', () => {
    const input = interval(-1, 1);
    const output = enforceIntervalBounds(input, BOUNDS);
    input.should.deepEqual(interval(-1, 1));
    output.should.not.deepEqual(interval(-1, 1));
  });
});

describe('enforceIntervalExtent', () => {
  const MIN_EXTENT = 5, MAX_EXTENT = 10;

  const TEST_CASES = [
    {
      description: 'should increase the endpoints symmetrically to match the minimum extent when the interval is too short',
      interval: interval(1, 2),
      output: interval(-1, 4)
    }, {
      description: 'should do nothing if the interval is between the two extents',
      interval: interval(1, 7),
      output: interval(1, 7)
    }, {
      description: 'should decrease the endpoints symmetrically to match the maximum extend when the interval is too long',
      interval: interval(1, 15),
      output: interval(3, 13)
    }
  ];

  TEST_CASES.forEach(test => {
    it(test.description, () => {
      enforceIntervalExtent(test.interval, MIN_EXTENT, MAX_EXTENT).should.deepEqual(test.output);
    });
  });

  it('should not mutate in the input interval', () => {
    const input = interval(0, 10);
    const output = enforceIntervalExtent(input, 1, 5);
    input.should.deepEqual(interval(0, 10));
    output.should.not.deepEqual(interval(0, 10));
  });
});

describe('extendInterval', () => {
  it('should increase both endpoints symmetrically as a fraction of the extent', () => {
    extendInterval(interval(0, 10), 0.5).should.deepEqual(interval(-5, 15));
  });

  it('should not mutate in the input interval', () => {
    const input = interval(0, 10);
    const output = extendInterval(input, 0.5);
    input.should.deepEqual(interval(0, 10));
    output.should.not.deepEqual(interval(0, 10));
  });
});

describe('roundInterval', () => {
  it('should round each endpoint of the interval to the nearest integer', () => {
    roundInterval(interval(1.1, 1.9)).should.deepEqual(interval(1, 2));
  });

  it('should not mutate in the input interval', () => {
    const input = interval(1.1, 1.9);
    const output = roundInterval(input);
    input.should.deepEqual(interval(1.1, 1.9));
    output.should.not.deepEqual(interval(1.1, 1.9));
  });
});

describe('mergeIntervals', () => {
  it('should return null when a zero-length array is given', () => {
    should(mergeIntervals([])).be.null();
  });

  it('should return a interval with min-of-mins and max-of-maxes', () => {
    mergeIntervals([
      interval(0, 2),
      interval(1, 3)
    ]).should.deepEqual(interval(0, 3));
  });

  it('should not mutate the input ranges', () => {
    const r1 = interval(0, 2);
    const r2 = interval(1, 3);
    mergeIntervals([ r1, r2 ]);
    r1.should.deepEqual(interval(0, 2));
    r2.should.deepEqual(interval(1, 3));
  });
});

describe('rangeContains', () => {
  const SMALL_RANGE = { min: 1, max: 2 };
  const BIG_RANGE = { min: 0, max: 3 };

  it('should return true if the first interval is strictly larger than the second interval', () => {
    rangeContains(BIG_RANGE, SMALL_RANGE).should.be.true();
  });

  it('should return true if the first interval is equal to the second interval', () => {
    rangeContains(BIG_RANGE, BIG_RANGE).should.be.true();
  });

  it('should return false if the first interval is strictly smaller than the second interval', () => {
    rangeContains(SMALL_RANGE, BIG_RANGE).should.be.false();
  });
});


describe('panInterval', () => {
  it('should apply the delta value to both min and max', () => {
    panInterval({
      min: 0,
      max: 10
    }, 5).should.eql({
      min: 5,
      max: 15
    });
   });
});

describe('zoomInterval', () => {
  it('should zoom out when given a value less than 1', () => {
    zoomInterval({
      min: -1,
      max: 1
    }, 1/4, 0.5).should.eql({
      min: -4,
      max: 4
    });
  });

  it('should zoom in when given a value greater than 1', () => {
    zoomInterval({
      min: -1,
      max: 1
    }, 4, 0.5).should.eql({
      min: -1/4,
      max: 1/4
    });
  });

  it('should default to zooming equally on both bounds', () => {
    zoomInterval({
      min: -1,
      max: 1
    }, 1/4).should.eql({
      min: -4,
      max: 4
    });
  });

  it('should bias a zoom-in towards one end when given an anchor not equal to 1/2', () => {
    zoomInterval({
      min: -1,
      max: 1
    }, 4, 1).should.eql({
      min: 1/2,
      max: 1
    });
  });

  it('should bias a zoom-out towards one end when given an anchor not equal to 1/2', () => {
    zoomInterval({
      min: -1,
      max: 1
    }, 1/4, 1).should.eql({
      min: -7,
      max: 1
    });
  });
});
