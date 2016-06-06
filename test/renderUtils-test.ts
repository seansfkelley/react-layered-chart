import {
  getIndexBoundsForPointData,
  getIndexBoundsForSpanData
} from '../src/core/renderUtils';

describe('getIndexBoundsForPointData', () => {
  it('should return a half-open interval for the slice of data in bounds, plus one extra on each side', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 4 },
      { timestamp: 6 },
      { timestamp: 8 }
    ], {
      min: 3,
      max: 5
    }, 'timestamp').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should return firstIndex === lastIndex === 0 when the data is empty', () => {
    getIndexBoundsForPointData([], {
      min: -Infinity,
      max: Infinity
    }, 'timestamp').should.eql({
      firstIndex: 0,
      lastIndex: 0
    });
  });

  it('should return firstIndex === lastIndex === 0 when the bounds are completely before the data', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 }
    ], {
      min: -2,
      max: -1
    }, 'timestamp').should.eql({
      firstIndex: 0,
      lastIndex: 0
    });
  });

  it('should return firstIndex === lastIndex === length of data when the bounds are completely after the data', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 }
    ], {
      min: 1,
      max: 2
    }, 'timestamp').should.eql({
      firstIndex: 1,
      lastIndex: 1
    });
  });

  it('should accept arbitrarily deeply nested string accessors', () => {
    getIndexBoundsForPointData([
      { outer: { middle: { inner: 0 } } },
      { outer: { middle: { inner: 2 } } },
      { outer: { middle: { inner: 4 } } },
      { outer: { middle: { inner: 6 } } },
      { outer: { middle: { inner: 8 } } }
    ], {
      min: 3,
      max: 5
    }, 'outer.middle.inner').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should return 0 for firstIndex when the min bound is before the earliest timestamp', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 4 }
    ], {
      min: -1,
      max: 1
    }, 'timestamp').should.eql({
      firstIndex: 0,
      lastIndex: 2
    });
  });

  it('should return the length of the input for lastIndex when the max bound is after the last datapoint', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 4 }
    ], {
      min: 3,
      max: 5
    }, 'timestamp').should.eql({
      firstIndex: 1,
      lastIndex: 3
    });
  });

  it('should include a value that is equal to the min bound', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 4 },
      { timestamp: 6 },
      { timestamp: 8 }
    ], {
      min: 2,
      max: 5
    }, 'timestamp').should.eql({
      firstIndex: 0,
      lastIndex: 4
    });
  });

  it('should include a value that is equal to the max bound', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 4 },
      { timestamp: 6 },
      { timestamp: 8 }
    ], {
      min: 3,
      max: 4
    }, 'timestamp').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should include a value that is equal to both bounds', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 4 },
      { timestamp: 6 },
      { timestamp: 8 }
    ], {
      min: 4,
      max: 4
    }, 'timestamp').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should include all values at identical timestamps when they are within bounds', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 4 },
      { timestamp: 4 },
      { timestamp: 4 },
      { timestamp: 6 },
      { timestamp: 8 }
    ], {
      min: 3,
      max: 5
    }, 'timestamp').should.eql({
      firstIndex: 1,
      lastIndex: 6
    });
  });

  it('should include all identical values that are equal to the min bound', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 2 },
      { timestamp: 2 },
      { timestamp: 4 },
      { timestamp: 6 },
      { timestamp: 8 }
    ], {
      min: 2,
      max: 5
    }, 'timestamp').should.eql({
      firstIndex: 0,
      lastIndex: 6
    });
  });

  it('should include all identical values that are equal to the max bound', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 4 },
      { timestamp: 4 },
      { timestamp: 4 },
      { timestamp: 6 },
      { timestamp: 8 }
    ], {
      min: 3,
      max: 4
    }, 'timestamp').should.eql({
      firstIndex: 1,
      lastIndex: 6
    });
  });

  it('should include a value that is equal to both bounds', () => {
    getIndexBoundsForPointData([
      { timestamp: 0 },
      { timestamp: 2 },
      { timestamp: 4 },
      { timestamp: 4 },
      { timestamp: 4 },
      { timestamp: 6 },
      { timestamp: 8 }
    ], {
      min: 4,
      max: 4
    }, 'timestamp').should.eql({
      firstIndex: 1,
      lastIndex: 6
    });
  });
});

describe('getIndexBoundsForSpanData', () => {
  it('should return a half-open interval for the slice of data in bounds, plus one extra on each side', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 3.5,
      max: 5.5
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should return firstIndex === lastIndex === 0 when the data is empty', () => {
    getIndexBoundsForSpanData([], {
      min: -Infinity,
      max: Infinity
    }, 'min', 'max').should.eql({
      firstIndex: 0,
      lastIndex: 0
    });
  });

  it('should return firstIndex === lastIndex === 0 when the bounds are completely before the data', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 }
    ], {
      min: -2,
      max: -1
    }, 'min', 'max').should.eql({
      firstIndex: 0,
      lastIndex: 0
    });
  });

  it('should return firstIndex === lastIndex === length of data when the bounds are completely after the data', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 }
    ], {
      min: 2,
      max: 3
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 1
    });
  });

  it('should accept arbitrarily deeply nested string accessors', () => {
    getIndexBoundsForSpanData([
      { outer: { inner: { min: 0, max: 1 } } },
      { outer: { inner: { min: 2, max: 3 } } },
      { outer: { inner: { min: 4, max: 5 } } },
      { outer: { inner: { min: 6, max: 7 } } },
      { outer: { inner: { min: 8, max: 9 } } }
    ], {
      min: 3.5,
      max: 5.5
    }, 'outer.inner.min', 'outer.inner.max').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should return 0 for firstIndex when the min bound is strictly before the earliest timestamp', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 }
    ], {
      min: -2,
      max: 1.5
    }, 'min', 'max').should.eql({
      firstIndex: 0,
      lastIndex: 2
    });
  });

  it('should return the length of the input for lastIndex when the max bound is strictly after the last datapoint', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 }
    ], {
      min: 3.5,
      max: 5.5
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 3
    });
  });

  it('should include values that span across the min bound', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 4.5,
      max: 5.5
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should include values that span across the max bound', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 3.5,
      max: 4.5
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should include values whose min is equal to the min bound', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 4,
      max: 5.5
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should include values whose max is equal to the max bound', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 3.5,
      max: 5
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should include values whose max is equal to the min bound', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 5,
      max: 5.5
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should include values whose min is equal to the max bound', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 3.5,
      max: 4
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 4
    });
  });

  it('should include a value that is strictly larger than the bounds', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 9 },
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 3.5,
      max: 5.5
    }, 'min', 'max').should.eql({
      firstIndex: 0,
      lastIndex: 5
    });
  });

  it('should include multiple values that are all larger than the bounds', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 9 },
      { min: 1, max: 8 },
      { min: 2, max: 7 },
      { min: 3, max: 6 },
      { min: 4, max: 5 }
    ], {
      min: 4.25,
      max: 4.75
    }, 'min', 'max').should.eql({
      firstIndex: 0,
      lastIndex: 5
    });
  });

  it('should include a value that is equal to the bounds', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 3.5, max: 4 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 3.5,
      max: 5.5
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 5
    });
  });

  it('should include all values at identical timestamps when they are within bounds', () => {
    getIndexBoundsForSpanData([
      { min: 0, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 5 },
      { min: 4, max: 5 },
      { min: 4, max: 5 },
      { min: 6, max: 7 },
      { min: 8, max: 9 }
    ], {
      min: 3.5,
      max: 5.5
    }, 'min', 'max').should.eql({
      firstIndex: 1,
      lastIndex: 6
    });
  });
});
