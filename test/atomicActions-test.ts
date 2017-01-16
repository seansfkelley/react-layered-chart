import * as _ from 'lodash';
import { expect } from 'chai';

import { TBySeriesId, LoadedSeriesData, DataLoader } from '../src/connected/interfaces';
import reducer from '../src/connected/flux/reducer';
import { objectWithKeys } from '../src/connected/flux/reducerUtils';
import { ChartState } from '../src/connected/model/state';
import { DEFAULT_Y_DOMAIN } from '../src/connected/model/constants';

import {
  Action,
  setSeriesIds,
  setDataLoader,
  setDataLoaderDebounceTimeout,
  setDataLoaderContext,
  setChartPhysicalWidth,
  setXDomain,
  setOverrideXDomain,
  setYDomains,
  setOverrideYDomains,
  setHover,
  setOverrideHover,
  setSelection,
  setOverrideSelection,
  dataRequested,
  dataReturned,
  dataErrored
} from '../src/connected/flux/atomicActions';

function pickKeyedState(state: ChartState) {
  return {
    loadedDataBySeriesId: state.loadedDataBySeriesId,
    loadVersionBySeriesId: state.loadVersionBySeriesId,
    errorBySeriesId: state.errorBySeriesId
  };
}

function serial(state: ChartState, ...actions: Action<any>[]): ChartState {
  actions.forEach(action => state = reducer(state, action));
  return state;
}

describe('(atomic actions)', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const ALL_SERIES_IDS = [SERIES_A, SERIES_B];
  const DATA_A = [{ __a: true }];
  const DATA_B = [{ __b: true }];
  const INTERVAL_A = { min: 0, max: 10 };
  const INTERVAL_B = { min: 100, max: 1000 };
  const DUMMY_INTERVAL = { min: -1, max: 1 };
  const ALL_SERIES_DATA: TBySeriesId<LoadedSeriesData> = {
    [SERIES_A]: {
      data: DATA_A,
      yDomain: INTERVAL_A
    },
    [SERIES_B]: {
      data: DATA_B,
      yDomain: INTERVAL_B
    }
  };
  const ALL_INTERVALS = {
    [SERIES_A]: INTERVAL_A,
    [SERIES_B]: INTERVAL_B
  };
  const ERROR = { __error: true };

  let state: ChartState;

  beforeEach(() => {
    state = {
      debounceTimeout: 1000,
      physicalChartWidth: 0,
      seriesIds: [],
      loadedDataBySeriesId: {},
      loadVersionBySeriesId: {},
      errorBySeriesId: {},
      dataLoader: function() {} as any as DataLoader,
      uiState: {
        xDomain: DUMMY_INTERVAL,
        yDomainBySeriesId: {}
      },
      uiStateConsumerOverrides: {}
    };
  });

  describe('setSeriesIds', () => {
    it('should put defaults in for all fields that are keyed by series ID', () => {
      state = reducer(state, setSeriesIds(ALL_SERIES_IDS));

      expect(state.seriesIds).to.deep.equal(ALL_SERIES_IDS);
      expect(pickKeyedState(state)).to.deep.equal({
        loadedDataBySeriesId: objectWithKeys(ALL_SERIES_IDS, { data: [], yDomain: DEFAULT_Y_DOMAIN }),
        loadVersionBySeriesId: objectWithKeys(ALL_SERIES_IDS, null),
        errorBySeriesId: objectWithKeys(ALL_SERIES_IDS, null),
      });
    });

    it('should remove outdated keys from fields that are keyed by series ID', () => {
      const ONLY_SERIES_A = [SERIES_A];
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        setSeriesIds(ONLY_SERIES_A)
      );

      expect(state.seriesIds).to.deep.equal(ONLY_SERIES_A);
      expect(pickKeyedState(state)).to.deep.equal({
        loadedDataBySeriesId: objectWithKeys(ONLY_SERIES_A, { data: [], yDomain: DEFAULT_Y_DOMAIN }),
        loadVersionBySeriesId: objectWithKeys(ONLY_SERIES_A, null),
        errorBySeriesId: objectWithKeys(ONLY_SERIES_A, null)
      });
    });
  });

  describe('setDataLoader', () => {
    const dataLoader: any = function() {};

    it('should set the dataLoader field', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        setDataLoader(dataLoader)
      );

      expect(state.dataLoader).to.equal(dataLoader);
    });

    it('should not unset any already-loaded data', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataReturned(ALL_SERIES_DATA)
      );

      expect(state.loadedDataBySeriesId).to.deep.equal(ALL_SERIES_DATA);

      state = reducer(state, setDataLoader(dataLoader));

      expect(state.loadedDataBySeriesId).to.deep.equal(ALL_SERIES_DATA);
    });
  });

  describe('dataRequested', () => {
     it('should update the load versions for only the series specified', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested([ SERIES_A ])
      );

      expect(state.loadVersionBySeriesId).to.have.keys(ALL_SERIES_IDS);
      expect(state.loadVersionBySeriesId[SERIES_A]).to.not.be.null;
      expect(state.loadVersionBySeriesId[SERIES_B]).to.be.null;
    });

    it('should not change anything other than the load versions', () => {
      state = reducer(state, setSeriesIds(ALL_SERIES_IDS));

      const startingState = state;

      state = reducer(state, dataRequested(ALL_SERIES_IDS));

      expect(_.omit(state, 'loadVersionBySeriesId')).to.deep.equal(_.omit(startingState, 'loadVersionBySeriesId'));
    });
  });

  describe('dataReturned', () => {
     it('should clear the load version when a load returns for a particular series', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned({
          [SERIES_A]: {
            data: DATA_A,
            yDomain: INTERVAL_A
          }
        })
      );

      expect(state.loadVersionBySeriesId).to.have.keys(ALL_SERIES_IDS);
      expect(state.loadVersionBySeriesId[SERIES_A]).to.be.null;
      expect(state.loadVersionBySeriesId[SERIES_B]).to.not.be.null;
    });

    it('should clear the load version and set the data for all series when they return successfully simultaneously', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned(ALL_SERIES_DATA)
      );

      expect(pickKeyedState(state)).to.deep.equal({
        loadedDataBySeriesId: ALL_SERIES_DATA,
        loadVersionBySeriesId: objectWithKeys(ALL_SERIES_IDS, null),
        errorBySeriesId: objectWithKeys(ALL_SERIES_IDS, null)
      });
    });

    it('should clear the loading state and set the data for a single series that returns successfully', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned({
          [SERIES_A]: {
            data: DATA_A,
            yDomain: INTERVAL_A
          }
        })
      );

      expect(state.loadedDataBySeriesId).to.deep.equal({
        [SERIES_A]: {
          data: DATA_A,
          yDomain: INTERVAL_A
        },
        [SERIES_B]: {
          data: [],
          yDomain: DEFAULT_Y_DOMAIN
        }
      });

      expect(state.loadVersionBySeriesId[SERIES_A]).to.be.null;
      expect(state.loadVersionBySeriesId[SERIES_B]).to.not.be.null;
    });
  });

  describe('dataErrored', () => {
    it('should clear the loading state, set the error state, and not change the data for all series when they return in error simultaneously', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned(ALL_SERIES_DATA),
        dataRequested(ALL_SERIES_IDS),
        dataErrored(objectWithKeys(ALL_SERIES_IDS, ERROR))
      );

      expect(pickKeyedState(state)).to.deep.equal({
        loadedDataBySeriesId: ALL_SERIES_DATA,
        loadVersionBySeriesId: objectWithKeys(ALL_SERIES_IDS, null),
        errorBySeriesId: objectWithKeys(ALL_SERIES_IDS, ERROR)
      });
    });

    it('should clear the loading state, set the error state, and not change the data for a single series that returns in error', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned(ALL_SERIES_DATA),
        dataRequested(ALL_SERIES_IDS),
        dataErrored({
          [SERIES_A]: ERROR
        })
      );

      expect(state.loadedDataBySeriesId).to.deep.equal(ALL_SERIES_DATA);

      expect(state.loadVersionBySeriesId[SERIES_A]).to.be.null;
      expect(state.loadVersionBySeriesId[SERIES_B]).to.not.be.null;

      expect(state.errorBySeriesId).to.deep.equal({
        [SERIES_A]: ERROR,
        [SERIES_B]: null
      });
    });
  });

  describe('(pass-throughs)', () => {
    beforeEach(() => {
      state = {
        physicalChartWidth: 0,
        uiState: {
          xDomain: DUMMY_INTERVAL,
          yDomainBySeriesId: {
            [SERIES_A]: DUMMY_INTERVAL,
            [SERIES_B]: DUMMY_INTERVAL
          },
          hover: 0,
          selection: DUMMY_INTERVAL
        },
        uiStateConsumerOverrides: {
          xDomain: DUMMY_INTERVAL,
          yDomainBySeriesId: {
            [SERIES_A]: DUMMY_INTERVAL,
            [SERIES_B]: DUMMY_INTERVAL
          },
          hover: 0,
          selection: DUMMY_INTERVAL
        }
      } as any as ChartState;
    });

    interface PassThroughTestCase<P> {
      name: string;
      actionCreator: (payload: P) => Action<P>;
      actionValue: P;
      valuePath: string;
    }

    const TEST_CASES: PassThroughTestCase<any>[] = [{
      name: 'setDataLoaderDebounceTimeout',
      actionCreator: setDataLoaderDebounceTimeout,
      actionValue: 1337,
      valuePath: 'debounceTimeout'
    }, {
      name: 'setDataLoaderContext',
      actionCreator: setDataLoaderContext,
      actionValue: { foo: 'bar' },
      valuePath: 'loaderContext'
    }, {
      name: 'setChartPhysicalWidth',
      actionCreator: setChartPhysicalWidth,
      actionValue: 1337,
      valuePath: 'physicalChartWidth'
    }, {
      name: 'setXDomain',
      actionCreator: setXDomain,
      actionValue: INTERVAL_A,
      valuePath: 'uiState.xDomain'
    }, {
      name: 'setOverrideXDomain',
      actionCreator: setOverrideXDomain,
      actionValue: INTERVAL_A,
      valuePath: 'uiStateConsumerOverrides.xDomain'
    }, {
      name: 'setYDomains',
      actionCreator: setYDomains,
      actionValue: ALL_INTERVALS,
      valuePath: 'uiState.yDomainBySeriesId'
    }, {
      name: 'setOverrideYDomains',
      actionCreator: setOverrideYDomains,
      actionValue: ALL_INTERVALS,
      valuePath: 'uiStateConsumerOverrides.yDomainBySeriesId'
    }, {
      name: 'setHover',
      actionCreator: setHover,
      actionValue: 1337,
      valuePath: 'uiState.hover'
    }, {
      name: 'setOverrideHover',
      actionCreator: setOverrideHover,
      actionValue: 1337,
      valuePath: 'uiStateConsumerOverrides.hover'
    }, {
      name: 'setSelection',
      actionCreator: setSelection,
      actionValue: INTERVAL_A,
      valuePath: 'uiState.selection'
    }, {
      name: 'setOverrideSelection',
      actionCreator: setOverrideSelection,
      actionValue: INTERVAL_A,
      valuePath: 'uiStateConsumerOverrides.selection'
    }];

    _.each(TEST_CASES, test => {
      const DUMMY_VALUE = function() {};

      describe(test.name, () => {
        it(`should set only the ${test.valuePath} field`, () => {
          const previousState = state;

          state = reducer(state, test.actionCreator(test.actionValue));

          expect(_.get(state, test.valuePath)).to.equal(test.actionValue);

          _.set(previousState, test.valuePath, DUMMY_VALUE);
          _.set(state, test.valuePath, DUMMY_VALUE);

          expect(state).to.deep.equal(previousState);
        });
      });
    });
  });
});
