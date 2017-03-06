import { expect } from 'chai';

import { Interval } from '../src/core/interfaces';
import {
  selectXDomain,
  selectYDomains,
  selectHover,
  selectSelection,
  selectLoadedYDomains,
  selectData
} from '../src/connected/model/selectors';
import {
  selectIsLoading,
  createSelectDataForHover
} from '../src/connected/export-only/exportableSelectors';

describe('(selectors)', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const SERIES_C = 'c';
  const INTERVAL_A: Interval = { min: 0, max: 1 };
  const INTERVAL_B: Interval = { min: 2, max: 3 };
  const INTERVAL_C: Interval = { min: 4, max: 5 };
  const DATA_A = [{ a: true }];

  describe('selectXDomain', () => {
    it('should use the internal value if no override is set', () => {
      expect(selectXDomain({
        uiState: {
          xDomain: INTERVAL_A
        },
        uiStateConsumerOverrides: {}
      } as any)).to.equal(INTERVAL_A);
    });

    it('should use the override if set', () => {
      expect(selectXDomain({
        uiState: {
          xDomain: INTERVAL_A
        },
        uiStateConsumerOverrides: {
          xDomain: INTERVAL_B
        }
      } as any)).to.equal(INTERVAL_B);
    });
  });

  describe('selectYDomains', () => {
    it('should use the loaded value if no action-set value or override are set', () => {
      expect(selectYDomains({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: [],
            yDomain: INTERVAL_A
          }
        },
        uiState: {},
        uiStateConsumerOverrides: {}
      } as any)).to.deep.equal({
        [SERIES_A]: INTERVAL_A
      });
    });

    it('should use the action-set value if no override is set', () => {
      expect(selectYDomains({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: [],
            yDomain: INTERVAL_B
          }
        },
        uiState: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_A
          }
        },
        uiStateConsumerOverrides: {}
      } as any)).to.deep.equal({
        [SERIES_A]: INTERVAL_A
      });
    });

    it('should use the override if all three values are set', () => {
      expect(selectYDomains({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: [],
            yDomain: INTERVAL_B
          }
        },
        uiState: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_B
          }
        },
        uiStateConsumerOverrides: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_A
          }
        }
      } as any)).to.deep.equal({
        [SERIES_A]: INTERVAL_A
      });
    });

    it('should use the override if set', () => {
      expect(selectYDomains({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: [],
            yDomain: INTERVAL_B
          }
        },
        uiState: {},
        uiStateConsumerOverrides: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_A
          }
        }
      } as any)).to.deep.equal({
        [SERIES_A]: INTERVAL_A
      });
    });

    it('should merge subets of domains from different settings, preferring override, then action-set, then loaded', () => {
      expect(selectYDomains({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: [],
            yDomain: INTERVAL_A
          },
          [SERIES_B]: {
            data: [],
            yDomain: INTERVAL_A
          }
        },
        uiState: {
          yDomainBySeriesId: {
            [SERIES_B]: INTERVAL_B,
            [SERIES_C]: INTERVAL_B
          }
        },
        uiStateConsumerOverrides: {
          yDomainBySeriesId: {
            [SERIES_C]: INTERVAL_C
          }
        }
      } as any)).to.deep.equal({
        [SERIES_A]: INTERVAL_A,
        [SERIES_B]: INTERVAL_B,
        [SERIES_C]: INTERVAL_C
      });
    });
  });

  describe('selectHover', () => {
    it('should use the internal value if no override is set', () => {
      expect(selectHover({
        uiState: {
          hover: 5
        },
        uiStateConsumerOverrides: {}
      } as any)).to.equal(5);
    });

    it('should use the override if set', () => {
      expect(selectHover({
        uiState: {
          hover: 5
        },
        uiStateConsumerOverrides: {
          hover: 10
        }
      } as any)).to.equal(10);
    });

    it('should use the override even if it\'s set to 0', () => {
      expect(selectHover({
        uiState: {
          hover: 5
        },
        uiStateConsumerOverrides: {
          hover: 0
        }
      } as any)).to.equal(0);
    });

    it('should not exist when the override is set to \'none\'', () => {
      expect(selectHover({
        uiState: {
          hover: 5
        },
        uiStateConsumerOverrides: {
          hover: 'none'
        }
      } as any)).to.not.exist;
    });
  });

  describe('selectSelection', () => {
    it('should use the internal value if no override is set', () => {
      expect(selectSelection({
        uiState: {
          selection: INTERVAL_A
        },
        uiStateConsumerOverrides: {}
      } as any)).to.equal(INTERVAL_A);
    });

    it('should use the override if set', () => {
      expect(selectSelection({
        uiState: {
          selection: INTERVAL_A
        },
        uiStateConsumerOverrides: {
          selection: INTERVAL_B
        }
      } as any)).to.equal(INTERVAL_B);
    });

    it('should not exist when the override is set to \'none\'', () => {
      expect(selectHover({
        uiState: {
          selection: INTERVAL_A
        },
        uiStateConsumerOverrides: {
          selection: 'none'
        }
      } as any)).to.not.exist;
    });
  });

  describe('selectLoadedYDomains', () => {
    it('should select only the loaded Y domains even if action-set values and overrides are set', () => {
      expect(selectLoadedYDomains({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: [],
            yDomain: INTERVAL_A
          }
        },
        uiState: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_B
          }
        },
        uiStateConsumerOverrides: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_B
          }
        }
      } as any)).to.deep.equal({
        [SERIES_A]: INTERVAL_A
      });
    });
  });

  describe('selectData', () => {
    it('should select only the data arrays', () => {
      expect(selectData({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: DATA_A,
            yDomain: INTERVAL_A
          }
        }
      } as any)).to.deep.equal({
        [SERIES_A]: DATA_A
      });
    });
  });

  describe('selectIsLoading', () => {
    it('should convert the raw map to be a map to booleans', () => {
      expect(selectIsLoading({
        loadVersionBySeriesId: {
          [SERIES_A]: null,
          [SERIES_B]: 'foo'
        }
      } as any)).to.deep.equal({
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
      expect(selectDataForHover({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: [{ x: 0}],
            yDomain: INTERVAL_A
          }
        },
        uiState: {
          hover: null
        },
        uiStateConsumerOverrides: {}
      } as any)).to.deep.equal({
        [SERIES_A]: undefined
      });
    });

    it('should return undefineds for empty series', () => {
      expect(selectDataForHover({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: [],
            yDomain: INTERVAL_A
          }
        },
        uiState: {
          hover: 10
        },
        uiStateConsumerOverrides: {}
      } as any)).to.deep.equal({
        [SERIES_A]: undefined
      });
    });

    it('should return the datum immediately preceding the hover value', () => {
      expect(selectDataForHover({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: DATA,
            yDomain: INTERVAL_A
          }
        },
        uiState: {
          hover: 10
        },
        uiStateConsumerOverrides: {}
      } as any)[SERIES_A]).to.equal(DATUM_1);
    });

    it('should return undefined for series whose earilest datum is after the hover', () => {
      expect(selectDataForHover({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: DATA,
            yDomain: INTERVAL_A
          }
        },
        uiState: {
          hover: 0
        },
        uiStateConsumerOverrides: {}
      } as any)).to.deep.equal({
        [SERIES_A]: undefined
      });
    });

    it('should return the datum immediately preceding the hover value when hover is overridden', () => {
      expect(selectDataForHover({
        loadedDataBySeriesId: {
          [SERIES_A]: {
            data: DATA,
            yDomain: INTERVAL_A
          }
        },
        uiState: {
          hover: null
        },
        uiStateConsumerOverrides: {
          hover: 10
        }
      } as any)[SERIES_A]).to.equal(DATUM_1);
    });
  });
});
