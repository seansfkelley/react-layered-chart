import { Interval } from '../src/core/interfaces';
import {
  selectXDomain,
  selectYDomains,
  selectHover,
  selectSelection
} from '../src/connected/model/selectors';
import {
  selectIsLoading,
  createSelectDataForHover
} from '../src/connected/export-only/exportableSelectors';

describe('(selectors)', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const INTERVAL_A: Interval = { min: 0, max: 1 };
  const INTERVAL_B: Interval = { min: 2, max: 3 };

  describe('selectXDomain', () => {
    it('should use the internal value if no override is set', () => {
      selectXDomain({
        uiState: {
          xDomain: INTERVAL_A
        },
        uiStateConsumerOverrides: {}
      } as any).should.be.exactly(INTERVAL_A);
    });

    it('should use the override if set', () => {
      selectXDomain({
        uiState: {
          xDomain: INTERVAL_A
        },
        uiStateConsumerOverrides: {
          xDomain: INTERVAL_B
        }
      } as any).should.be.exactly(INTERVAL_B);
    });
  });

  describe('selectYDomains', () => {
    it('should use the internal value if no override is set', () => {
      selectYDomains({
        uiState: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_A
          }
        },
        uiStateConsumerOverrides: {}
      } as any).should.deepEqual({
        [SERIES_A]: INTERVAL_A
      });
    });

    it('should use the override if set', () => {
      selectYDomains({
        uiState: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_A
          }
        },
        uiStateConsumerOverrides: {
          yDomainBySeriesId: {
            [SERIES_B]: INTERVAL_B
          }
        }
      } as any).should.deepEqual({
        [SERIES_B]: INTERVAL_B
      });
    });
  });

  describe('selectHover', () => {
    it('should use the internal value if no override is set', () => {
      selectHover({
        uiState: {
          hover: 5
        },
        uiStateConsumerOverrides: {}
      } as any).should.equal(5);
    });

    it('should use the override if set', () => {
      selectHover({
        uiState: {
          hover: 5
        },
        uiStateConsumerOverrides: {
          hover: 10
        }
      } as any).should.equal(10);
    });

    it('should use the override even if it\'s set to 0', () => {
      selectHover({
        uiState: {
          hover: 5
        },
        uiStateConsumerOverrides: {
          hover: 0
        }
      } as any).should.equal(0);
    });
  });

  describe('selectSelection', () => {
    it('should use the internal value if no override is set', () => {
      selectSelection({
        uiState: {
          selection: INTERVAL_A
        },
        uiStateConsumerOverrides: {}
      } as any).should.be.exactly(INTERVAL_A);
    });

    it('should use the override if set', () => {
      selectSelection({
        uiState: {
          selection: INTERVAL_A
        },
        uiStateConsumerOverrides: {
          selection: INTERVAL_B
        }
      } as any).should.be.exactly(INTERVAL_B);
    });
  });

  describe('selectIsLoading', () => {
    it('should convert the raw map to be a map to booleans', () => {
      selectIsLoading({
        loadVersionBySeriesId: {
          [SERIES_A]: null,
          [SERIES_B]: 'foo'
        }
      } as any).should.deepEqual({
        [SERIES_A]: false,
        [SERIES_B]: true
      });
    });
  });

  describe('createSelectDataForHover', () => {
    const xValueSelector = (seriesId, datum) => datum.x;
    const selectDataForHover = createSelectDataForHover(xValueSelector);

    const DATUM_1 = { x: 5 };
    const DATUM_2 = { x: 10 };
    const DATA = [ DATUM_1, DATUM_2 ];

    it('should return undefineds if hover is unset', () => {
      selectDataForHover({
        dataBySeriesId: {
          [SERIES_A]: [{ x: 0}]
        },
        uiState: {
          hover: null
        },
        uiStateConsumerOverrides: {}
      } as any).should.deepEqual({
        [SERIES_A]: undefined
      });
    });

    it('should return undefineds for empty series', () => {
      selectDataForHover({
        dataBySeriesId: {
          [SERIES_A]: []
        },
        uiState: {
          hover: 10
        },
        uiStateConsumerOverrides: {}
      } as any).should.deepEqual({
        [SERIES_A]: undefined
      });
    });

    it('should return the datum immediately preceding the hover value', () => {
      selectDataForHover({
        dataBySeriesId: {
          [SERIES_A]: DATA
        },
        uiState: {
          hover: 10
        },
        uiStateConsumerOverrides: {}
      } as any)[SERIES_A].should.be.exactly(DATUM_1);
    });

    it('should return undefined for series whose earilest datum is after the hover', () => {
      selectDataForHover({
        dataBySeriesId: {
          [SERIES_A]: DATA
        },
        uiState: {
          hover: 0
        },
        uiStateConsumerOverrides: {}
      } as any).should.deepEqual({
        [SERIES_A]: undefined
      });
    });

    it('should return the datum immediately preceding the hover value when hover is overridden', () => {
      selectDataForHover({
        dataBySeriesId: {
          [SERIES_A]: DATA
        },
        uiState: {
          hover: null
        },
        uiStateConsumerOverrides: {
          hover: 10
        }
      } as any)[SERIES_A].should.be.exactly(DATUM_1);
    });
  });
});
