import { Interval } from '../src/core/interfaces';
import {
  selectXDomain,
  selectYDomains,
  selectHover,
  selectSelection
} from '../src/connected/model/selectors';
import {
  selectIsLoading
} from '../src/connected/export-only/exportableSelectors';

describe('(selectors)', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const SERIES_C = 'c';
  const INTERVAL_A: Interval = { min: 0, max: 1 };
  const INTERVAL_B: Interval = { min: 2, max: 3 };
  const INTERVAL_C: Interval = { min: 4, max: 5 };

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
      } as any).should.deepEqual({ [SERIES_A]: INTERVAL_A });
    });

    it('should use the override for any series that have it set', () => {
      selectYDomains({
        uiState: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_A,
            [SERIES_B]: INTERVAL_B
          }
        },
        uiStateConsumerOverrides: {
          yDomainBySeriesId: {
            [SERIES_A]: INTERVAL_C
          }
        }
      } as any).should.deepEqual({
        [SERIES_A]: INTERVAL_C,
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
});
