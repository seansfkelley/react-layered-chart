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
