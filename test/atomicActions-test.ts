import * as _ from 'lodash';
import * as should from 'should';

import { SeriesData } from '../src/core/interfaces';
import { TBySeriesId } from '../src/connected/interfaces';
import reducer from '../src/connected/flux/reducer';
import { objectWithKeys } from '../src/connected/flux/reducerUtils';
import { ChartState, DEFAULT_CHART_STATE } from '../src/connected/model/state';
import { DEFAULT_Y_DOMAIN } from '../src/connected/model/constants';

import {
  Action,
  setSeriesIds,
  setDataLoader,
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
    dataBySeriesId: state.dataBySeriesId,
    loadVersionBySeriesId: state.loadVersionBySeriesId,
    errorBySeriesId: state.errorBySeriesId,
    yDomainBySeriesId: state.uiState.yDomainBySeriesId
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
  const ALL_SERIES_DATA: TBySeriesId<SeriesData> = {
    [SERIES_A]: DATA_A,
    [SERIES_B]: DATA_B
  };
  const INTERVAL_A = { min: 0, max: 10 };
  const INTERVAL_B = { min: 100, max: 1000 };
  const DUMMY_INTERVAL = { min: -1, max: 1 };
  const ALL_INTERVALS = {
    [SERIES_A]: INTERVAL_A,
    [SERIES_B]: INTERVAL_B
  };
  const ERROR = { __error: true };

  let state: ChartState;

  beforeEach(() => {
    state = {
      physicalChartWidth: 0,
      seriesIds: [],
      dataBySeriesId: {},
      loadVersionBySeriesId: {},
      errorBySeriesId: {},
      dataLoader: null,
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

      state.seriesIds.should.deepEqual(ALL_SERIES_IDS);
      pickKeyedState(state).should.deepEqual({
        dataBySeriesId: objectWithKeys(ALL_SERIES_IDS, []),
        loadVersionBySeriesId: objectWithKeys(ALL_SERIES_IDS, null),
        errorBySeriesId: objectWithKeys(ALL_SERIES_IDS, null),
        yDomainBySeriesId: objectWithKeys(ALL_SERIES_IDS, DEFAULT_Y_DOMAIN)
      });
    });

    it('should do nothing if the same set of series IDs is provided that already exists', () => {
      const beforeState = reducer(state, setSeriesIds(ALL_SERIES_IDS));
      const afterState = reducer(beforeState, setSeriesIds(_.clone(ALL_SERIES_IDS).reverse()));

      beforeState.should.be.exactly(afterState);
    });

    it('should remove outdated keys from fields that are keyed by series ID', () => {
      const ONLY_SERIES_A = [SERIES_A];
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        setSeriesIds(ONLY_SERIES_A)
      );

      state.seriesIds.should.deepEqual(ONLY_SERIES_A);
      pickKeyedState(state).should.deepEqual({
        dataBySeriesId: objectWithKeys(ONLY_SERIES_A, []),
        loadVersionBySeriesId: objectWithKeys(ONLY_SERIES_A, null),
        errorBySeriesId: objectWithKeys(ONLY_SERIES_A, null),
        yDomainBySeriesId: objectWithKeys(ONLY_SERIES_A, DEFAULT_Y_DOMAIN)
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

      state.dataLoader.should.be.exactly(dataLoader);
    });

    it('should not unset any already-loaded data', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataReturned(ALL_SERIES_DATA)
      );

      state.dataBySeriesId.should.deepEqual(ALL_SERIES_DATA);

      state = reducer(state, setDataLoader(dataLoader));

      state.dataBySeriesId.should.deepEqual(ALL_SERIES_DATA);
    });
  });

  describe('dataRequested', () => {
     it('should update the load versions for only the series specified', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested([ SERIES_A ])
      );

      state.loadVersionBySeriesId.should.have.keys(ALL_SERIES_IDS);
      should(state.loadVersionBySeriesId[SERIES_A]).not.be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).be.null();
    });

    it('should not change anything other than the load versions', () => {
      state = reducer(state, setSeriesIds(ALL_SERIES_IDS));

      const startingState = state;

      state = reducer(state, dataRequested(ALL_SERIES_IDS));

      _.omit(state, 'loadVersionBySeriesId').should.deepEqual(_.omit(startingState, 'loadVersionBySeriesId'));
    });
  });

  describe('dataReturned', () => {
     it('should clear the load version when a load returns for a particular series', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned({ [SERIES_A]: DATA_A })
      );

      state.loadVersionBySeriesId.should.have.keys(ALL_SERIES_IDS);
      should(state.loadVersionBySeriesId[SERIES_A]).be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).not.be.null();
    });

    it('should clear the load version and set the data for all series when they return successfully simultaneously', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned({
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        })
      );

      pickKeyedState(state).should.deepEqual({
        dataBySeriesId: {
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        },
        loadVersionBySeriesId: objectWithKeys(ALL_SERIES_IDS, null),
        errorBySeriesId: objectWithKeys(ALL_SERIES_IDS, null),
        yDomainBySeriesId: objectWithKeys(ALL_SERIES_IDS, DEFAULT_Y_DOMAIN)
      });
    });

    it('should clear the loading state and set the data for a single series that returns successfully', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned({
          [SERIES_A]: DATA_A
        })
      );

      state.dataBySeriesId.should.deepEqual({
        [SERIES_A]: DATA_A,
        [SERIES_B]: []
      });

      should(state.loadVersionBySeriesId[SERIES_A]).be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).not.be.null();
    });
  });

  describe('dataErrored', () => {
    it('should clear the loading state, set the error state, and not change the data for all series when they return in error simultaneously', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned({
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        }),
        dataRequested(ALL_SERIES_IDS),
        dataErrored(objectWithKeys(ALL_SERIES_IDS, ERROR))
      );

      pickKeyedState(state).should.deepEqual({
        dataBySeriesId: {
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        },
        loadVersionBySeriesId: objectWithKeys(ALL_SERIES_IDS, null),
        errorBySeriesId: objectWithKeys(ALL_SERIES_IDS, ERROR),
        yDomainBySeriesId: objectWithKeys(ALL_SERIES_IDS, DEFAULT_Y_DOMAIN)
      });
    });

    it('should clear the loading state, set the error state, and not change the data for a single series that returns in error', () => {
      state = serial(state,
        setSeriesIds(ALL_SERIES_IDS),
        dataRequested(ALL_SERIES_IDS),
        dataReturned({
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        }),
        dataRequested(ALL_SERIES_IDS),
        dataErrored({
          [SERIES_A]: ERROR
        })
      );

      state.dataBySeriesId.should.deepEqual({
        [SERIES_A]: DATA_A,
        [SERIES_B]: DATA_B
      });

      should(state.loadVersionBySeriesId[SERIES_A]).be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).not.be.null();

      state.errorBySeriesId.should.deepEqual({
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

          _.get(state, test.valuePath).should.be.exactly(test.actionValue);

          _.set(previousState, test.valuePath, DUMMY_VALUE);
          _.set(state, test.valuePath, DUMMY_VALUE);

          state.should.deepEqual(previousState);
        });
      });
    });
  });
});
