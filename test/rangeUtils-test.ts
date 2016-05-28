import * as _ from 'lodash';

import { Range } from '../src/core/interfaces';
import { enforceRangeBounds, enforceRangeExtent, extendRange, roundRange, mergeRanges, rangeContains } from '../src/connected/rangeUtils';
import { TBySeriesId } from '../src/connected/interfaces';

function range(min, max) {
  return { min, max };
}

describe('enforceRangeBounds', () => {
  const BOUNDS = range(0, 10);

  const TEST_CASES = [
    {
      description: 'should do nothing if the range is within bounds',
      range: range(1, 9),
      output: range(1, 9)
    }, {
      description: 'should slide the range forward without changing extent if the range is entirely before the early bound',
      range: range(-3, -1),
      output: range(0, 2)
    }, {
      description: 'should slide the range forward  without changing extent if the range starts before the early bound',
      range: range(-1, 1),
      output: range(0, 2)
    }, {
      description: 'should slide the range back without changing extent if the range ends after the later bound',
      range: range(9, 11),
      output: range(8, 10)
    }, {
      description: 'should slide the range back without changing extent if the range is entirely after the later bound',
      range: range(11, 13),
      output: range(8, 10)
    }, {
      description: 'should align the range and bounds by their centers if the range is longer than the bounds and extends on both ends',
      range: range(-1, 13),
      output: range(-2, 12)
    }, {
      description: 'should align the range and bounds by their centers if the range is longer than the bounds and starts before',
      range: range(-10, 2),
      output: range(-1, 11)
    }, {
      description: 'should align the range and bounds by their centers if the range is longer than the bounds and is entirely before',
      range: range(-13, -1),
      output: range(-1, 11)
    }, {
      description: 'should align the range and bounds by their centers if the range is longer than the bounds and ends after',
      range: range(1, 13),
      output: range(-1, 11)
    }, {
      description: 'should align the range and bounds by their centers if the range is longer than the bounds and is entirely after',
      range: range(11, 23),
      output: range(-1, 11)
    }
  ];

  TEST_CASES.forEach(test => {
    it(test.description, () => {
      enforceRangeBounds(test.range, BOUNDS).should.deepEqual(test.output);
    });
  });

  it('should not mutate the input range', () => {
    const input = range(-1, 1);
    const output = enforceRangeBounds(input, BOUNDS);
    input.should.deepEqual(range(-1, 1));
    output.should.not.deepEqual(range(-1, 1));
  });
});

describe('enforceRangeExtent', () => {
  const MIN_EXTENT = 5, MAX_EXTENT = 10;

  const TEST_CASES = [
    {
      description: 'should increase the endpoints symmetrically to match the minimum extent when the range is too short',
      range: range(1, 2),
      output: range(-1, 4)
    }, {
      description: 'should do nothing if the range is between the two extents',
      range: range(1, 7),
      output: range(1, 7)
    }, {
      description: 'should decrease the endpoints symmetrically to match the maximum extend when the range is too long',
      range: range(1, 15),
      output: range(3, 13)
    }
  ];

  TEST_CASES.forEach(test => {
    it(test.description, () => {
      enforceRangeExtent(test.range, MIN_EXTENT, MAX_EXTENT).should.deepEqual(test.output);
    });
  });

  it('should not mutate in the input range', () => {
    const input = range(0, 10);
    const output = enforceRangeExtent(input, 1, 5);
    input.should.deepEqual(range(0, 10));
    output.should.not.deepEqual(range(0, 10));
  });
});

describe('extendRange', () => {
  it('should increase both endpoints symmetrically as a fraction of the extent', () => {
    extendRange(range(0, 10), 0.5).should.deepEqual(range(-5, 15));
  });

  it('should not mutate in the input range', () => {
    const input = range(0, 10);
    const output = extendRange(input, 0.5);
    input.should.deepEqual(range(0, 10));
    output.should.not.deepEqual(range(0, 10));
  });
});

describe('roundRange', () => {
  it('should round each endpoint of the range to the nearest integer', () => {
    roundRange(range(1.1, 1.9)).should.deepEqual(range(1, 2));
  });

  it('should not mutate in the input range', () => {
    const input = range(1.1, 1.9);
    const output = roundRange(input);
    input.should.deepEqual(range(1.1, 1.9));
    output.should.not.deepEqual(range(1.1, 1.9));
  });
});

describe('mergeRanges', () => {
  const UNIQUE_GROUP_SCHEME = _.identity;
  const SAME_GROUP_SCHEME = () => 'same group for everyone!';

  it('should return an object with the same keys', () => {
    mergeRanges({
      a: { min: 0, max: 1 },
      b: { min: 1, max: 2 },
      c: { min: 2, max: 3 }
    }, UNIQUE_GROUP_SCHEME).should.have.keys([ 'a', 'b', 'c' ]);
  });

  it('should use the domain as-is for a domain in a group by itself', () => {
    mergeRanges({
      a: { min: 0, max: 1 }
    }, UNIQUE_GROUP_SCHEME).should.deepEqual({
      a: { min: 0, max: 1 }
    });
  });

  it('should not return a domain reference-equals to the input domain even if it\'s unchanged', () => {
    const input = { min: 0, max: 1 };
    const output = mergeRanges({
      a: input
    }, UNIQUE_GROUP_SCHEME)['a'];
    output.should.deepEqual(input);
    output.should.not.be.exactly(input);
  });

  it('should assign a reference-equals object to all domains that get merged', () => {
    const { a, b } = mergeRanges({
      a: { min: 0, max: 1 },
      b: { min: 0, max: 1 }
    }, SAME_GROUP_SCHEME);
    a.should.be.exactly(b);
  });

  it('should pick the exact min/max for all domains that end up grouped', () => {
    mergeRanges({
      a: { min: 0, max: 2 },
      b: { min: 1, max: 3}
    }, SAME_GROUP_SCHEME).should.deepEqual({
      a: { min: 0, max: 3 },
      b: { min: 0, max: 3 }
    })
  });

  it('should merge all the domains when no grouping function is provided', () => {
    mergeRanges({
      a: { min: 0, max: 2 },
      b: { min: 1, max: 3}
    }).should.deepEqual({
      a: { min: 0, max: 3 },
      b: { min: 0, max: 3 }
    });
  });

  it('should not mutate the input domains', () => {
    const input: TBySeriesId<Range> = {
      a: { min: 0, max: 2 },
      b: { min: 1, max: 3}
    };
    mergeRanges(input, SAME_GROUP_SCHEME);
    input.should.deepEqual({
      a: { min: 0, max: 2 },
      b: { min: 1, max: 3}
    });
  })
});

describe('rangeContains', () => {
  const SMALL_RANGE = { min: 1, max: 2 };
  const BIG_RANGE = { min: 0, max: 3 };

  it('should return true if the first range is strictly larger than the second range', () => {
    rangeContains(BIG_RANGE, SMALL_RANGE).should.be.true();
  });

  it('should return true if the first range is equal to the second range', () => {
    rangeContains(BIG_RANGE, BIG_RANGE).should.be.true();
  });

  it('should return false if the first range is strictly smaller than the second range', () => {
    rangeContains(SMALL_RANGE, BIG_RANGE).should.be.false();
  });
});
