import {
  getBoundsForInstantaeousData,
  getBoundsForTimeSpanData,
  resolvePan,
  resolveZoom
} from '../src/util';

describe('util', () => {
  describe('#getBoundsForInstantaeousData', () => {
    it('should return a half-open interval for the slice of data in bounds, plus one extra on each side', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ], { min: 3, max: 5 }, 'timestamp').should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should default to using the \'timestamp\' field', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ], { min: 3, max: 5 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should return firstIndex === lastIndex === 0 when the data is empty', () => {
      getBoundsForInstantaeousData([], { min: -Infinity, max: Infinity }).should.eql({
        firstIndex: 0,
        lastIndex: 0
      });
    });

    it('should return firstIndex === lastIndex === 0 when the bounds are completely before the data', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 }
      ], { min: -2, max: -1 }).should.eql({
        firstIndex: 0,
        lastIndex: 0
      });
    });

    it('should return firstIndex === lastIndex === length of data when the bounds are completely after the data', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 }
      ], { min: 1, max: 2 }).should.eql({
        firstIndex: 1,
        lastIndex: 1
      });
    });

    it('should accept shallow string accessors', () => {
      getBoundsForInstantaeousData([
        { theTime: 0 },
        { theTime: 2 },
        { theTime: 4 },
        { theTime: 6 },
        { theTime: 8 }
      ], { min: 3, max: 5 }, 'theTime').should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should accept arbitrarily deeply nested string accessors', () => {
      getBoundsForInstantaeousData([
        { outer: { middle: { inner: 0 } } },
        { outer: { middle: { inner: 2 } } },
        { outer: { middle: { inner: 4 } } },
        { outer: { middle: { inner: 6 } } },
        { outer: { middle: { inner: 8 } } }
      ], { min: 3, max: 5 }, 'outer.middle.inner').should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should return 0 for firstIndex when the min bound is before the earliest timestamp', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 }
      ], { min: -1, max: 1 }).should.eql({
        firstIndex: 0,
        lastIndex: 2
      });
    });

    it('should return the length of the input for lastIndex when the max bound is after the last datapoint', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 }
      ], { min: 3, max: 5 }).should.eql({
        firstIndex: 1,
        lastIndex: 3
      });
    });

    it('should include a value that is equal to the min bound', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ], { min: 2, max: 5 }).should.eql({
        firstIndex: 0,
        lastIndex: 4
      });
    });

    it('should include a value that is equal to the max bound', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ], { min: 3, max: 4 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should include a value that is equal to both bounds', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ], { min: 4, max: 4 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should include all values at identical timestamps when they are within bounds', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ], { min: 3, max: 5 }, 'timestamp').should.eql({
        firstIndex: 1,
        lastIndex: 6
      });
    });

    it('should include all identical values that are equal to the min bound', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 2 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ], { min: 2, max: 5 }).should.eql({
        firstIndex: 0,
        lastIndex: 6
      });
    });

    it('should include all identical values that are equal to the max bound', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ], { min: 3, max: 4 }).should.eql({
        firstIndex: 1,
        lastIndex: 6
      });
    });

    it('should include a value that is equal to both bounds', () => {
      getBoundsForInstantaeousData([
        { timestamp: 0 },
        { timestamp: 2 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 4 },
        { timestamp: 6 },
        { timestamp: 8 }
      ], { min: 4, max: 4 }).should.eql({
        firstIndex: 1,
        lastIndex: 6
      });
    });
  });

  describe('#getBoundsForTimeSpanData', () => {
    it('should return a half-open interval for the slice of data in bounds, plus one extra on each side', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 3.5, max: 5.5 }, 'timeSpan.min', 'timeSpan.max').should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should default to using the \'timeSpan.min\' and \'timeSpan.max\' fields', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 3.5, max: 5.5 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should return firstIndex === lastIndex === 0 when the data is empty', () => {
      getBoundsForTimeSpanData([], { min: -Infinity, max: Infinity }).should.eql({
        firstIndex: 0,
        lastIndex: 0
      });
    });

    it('should return firstIndex === lastIndex === 0 when the bounds are completely before the data', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } }
      ], { min: -2, max: -1 }).should.eql({
        firstIndex: 0,
        lastIndex: 0
      });
    });

    it('should return firstIndex === lastIndex === length of data when the bounds are completely after the data', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } }
      ], { min: 2, max: 3 }).should.eql({
        firstIndex: 1,
        lastIndex: 1
      });
    });

    it('should accept shallow string accessors', () => {
      getBoundsForTimeSpanData([
        { min: 0, max: 1 },
        { min: 2, max: 3 },
        { min: 4, max: 5 },
        { min: 6, max: 7 },
        { min: 8, max: 9 }
      ], { min: 3.5, max: 5.5 }, 'min', 'max').should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should accept arbitrarily deeply nested string accessors', () => {
      getBoundsForTimeSpanData([
        { outer: { inner: { min: 0, max: 1 } } },
        { outer: { inner: { min: 2, max: 3 } } },
        { outer: { inner: { min: 4, max: 5 } } },
        { outer: { inner: { min: 6, max: 7 } } },
        { outer: { inner: { min: 8, max: 9 } } }
      ], { min: 3.5, max: 5.5 }, 'outer.inner.min', 'outer.inner.max').should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should return 0 for firstIndex when the min bound is strictly before the earliest timestamp', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } }
      ], { min: -2, max: 1.5 }).should.eql({
        firstIndex: 0,
        lastIndex: 2
      });
    });

    it('should return the length of the input for lastIndex when the max bound is strictly after the last datapoint', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } }
      ], { min: 3.5, max: 5.5 }).should.eql({
        firstIndex: 1,
        lastIndex: 3
      });
    });

    it('should include values that span across the min bound', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 4.5, max: 5.5 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should include values that span across the max bound', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 3.5, max: 4.5 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should include values whose min is equal to the min bound', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 4, max: 5.5 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should include values whose max is equal to the max bound', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 3.5, max: 5 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should include values whose max is equal to the min bound', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 5, max: 5.5 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    it('should include values whose min is equal to the max bound', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 3.5, max: 4 }).should.eql({
        firstIndex: 1,
        lastIndex: 4
      });
    });

    xit('should include a value that is strictly larger than the bounds', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 9 } },
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 3.5, max: 5.5 }).should.eql({
        firstIndex: 0,
        lastIndex: 5
      });
    });

    it('should include multiple values that are all larger than the bounds', () => {
      // This works, but I'm not sure why, given that the previous test doesn't.
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 9 } },
        { timeSpan: { min: 1, max: 8 } },
        { timeSpan: { min: 2, max: 7 } },
        { timeSpan: { min: 3, max: 6 } },
        { timeSpan: { min: 4, max: 5 } }
      ], { min: 4.25, max: 4.75 }).should.eql({
        firstIndex: 0,
        lastIndex: 5
      });
    });

    it('should include a value that is equal to the bounds', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 3.5, max: 4 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 3.5, max: 5.5 }).should.eql({
        firstIndex: 1,
        lastIndex: 5
      });
    });

    it('should include all values at identical timestamps when they are within bounds', () => {
      getBoundsForTimeSpanData([
        { timeSpan: { min: 0, max: 1 } },
        { timeSpan: { min: 2, max: 3 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 4, max: 5 } },
        { timeSpan: { min: 6, max: 7 } },
        { timeSpan: { min: 8, max: 9 } }
      ], { min: 3.5, max: 5.5 }).should.eql({
        firstIndex: 1,
        lastIndex: 6
      });
    });
  });

  describe('#resolvePan', () => {
    it('should apply the delta value to both min and max', () => {
      resolvePan({
        min: 0,
        max: 10
      }, 5).should.eql({
        min: 5,
        max: 15
      });
     });
  });

  describe('#resolveZoom', () => {
    it('should zoom out when given a value less than 1', () => {
      resolveZoom({
        min: -1,
        max: 1
      }, 1/4, 0.5).should.eql({
        min: -4,
        max: 4
      });
    });

    it('should zoom in when given a value greater than 1', () => {
      resolveZoom({
        min: -1,
        max: 1
      }, 4, 0.5).should.eql({
        min: -1/4,
        max: 1/4
      });
    });

    it('should default to zooming equally on both bounds', () => {
      resolveZoom({
        min: -1,
        max: 1
      }, 1/4).should.eql({
        min: -4,
        max: 4
      });
    });

    it('should bias a zoom-in towards one end when given an anchor not equal to 1/2', () => {
      resolveZoom({
        min: -1,
        max: 1
      }, 4, 1).should.eql({
        min: 1/2,
        max: 1
      });
    });

    it('should bias a zoom-out towards one end when given an anchor not equal to 1/2', () => {
      resolveZoom({
        min: -1,
        max: 1
      }, 1/4, 1).should.eql({
        min: -7,
        max: 1
      });
    });
  });
});
