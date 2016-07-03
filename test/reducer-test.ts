import * as _ from 'lodash';
import * as should from 'should';

import reducer from '../src/connected/flux/reducer';
import { ChartState, DEFAULT_CHART_STATE } from '../src/connected/model/state';
import { ActionType, Action } from '../src/connected/model/ActionType';
import { DEFAULT_Y_DOMAIN } from '../src/connected/model/constants';
import * as atomicActions from '../src/connected/flux/atomicActions';

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

describe('reducer', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const ALL_SERIES = [SERIES_A, SERIES_B];
  const DATA_A = [{ __a: true }];
  const DATA_B = [{ __b: true }];
  const ERROR = { __error: true };

  let state: ChartState;

  beforeEach(() => {
    state = DEFAULT_CHART_STATE;
  });

  describe('(atomic actions)', () => {
    it('should put defaults in for all fields that are keyed by series ID when setting series IDs', () => {
      state = reducer(state, atomicActions.setSeriesIds(ALL_SERIES));

      state.seriesIds.should.deepEqual(ALL_SERIES);
      pickKeyedState(state).should.deepEqual({
        dataBySeriesId: objectWithKeys(ALL_SERIES, []),
        loadVersionBySeriesId: objectWithKeys(ALL_SERIES, null),
        errorBySeriesId: objectWithKeys(ALL_SERIES, null),
        yDomainBySeriesId: objectWithKeys(ALL_SERIES, DEFAULT_Y_DOMAIN)
      });
    });

    it('should do nothing if the same set of series IDs is provided that already exists', () => {
      const beforeState = reducer(state, atomicActions.setSeriesIds(ALL_SERIES));
      const afterState = reducer(beforeState, atomicActions.setSeriesIds(_.clone(ALL_SERIES).reverse()));

      beforeState.should.be.exactly(afterState);
    });

    it('should remove outdated keys from fields that are keyed by series ID when resetting series ID', () => {
      const ONLY_SERIES_A = [SERIES_A];
      state = serial(state,
        atomicActions.setSeriesIds(ALL_SERIES),
        atomicActions.setSeriesIds(ONLY_SERIES_A)
      );

      state.seriesIds.should.deepEqual(ONLY_SERIES_A);
      pickKeyedState(state).should.deepEqual({
        dataBySeriesId: objectWithKeys(ONLY_SERIES_A, []),
        loadVersionBySeriesId: objectWithKeys(ONLY_SERIES_A, null),
        errorBySeriesId: objectWithKeys(ONLY_SERIES_A, null),
        yDomainBySeriesId: objectWithKeys(ONLY_SERIES_A, DEFAULT_Y_DOMAIN)
      });
    });

    it('should update the load versions for only the series specified in a load request', () => {
      state = serial(state,
        atomicActions.setSeriesIds(ALL_SERIES),
        atomicActions.dataRequested([ SERIES_A ])
      );

      state.loadVersionBySeriesId.should.have.keys(ALL_SERIES);
      should(state.loadVersionBySeriesId[SERIES_A]).not.be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).be.null();
    });

    it('should not change anything other than the load versions in a load request', () => {
      state = reducer(state, atomicActions.setSeriesIds(ALL_SERIES));

      const startingState = state;

      state = reducer(state, atomicActions.dataRequested(ALL_SERIES));

      _.omit(state, 'loadVersionBySeriesId').should.deepEqual(_.omit(startingState, 'loadVersionBySeriesId'));
    });

    it('should clear the load version when a load returns for a particular series', () => {
      state = serial(state,
        atomicActions.setSeriesIds(ALL_SERIES),
        atomicActions.dataRequested(ALL_SERIES),
        atomicActions.dataReturned({ [SERIES_A]: DATA_A })
      );

      state.loadVersionBySeriesId.should.have.keys(ALL_SERIES);
      should(state.loadVersionBySeriesId[SERIES_A]).be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).not.be.null();
    });

    it('should clear the load version and set the data for all series when they return successfully simultaneously', () => {
      state = serial(state,
        atomicActions.setSeriesIds(ALL_SERIES),
        atomicActions.dataRequested(ALL_SERIES),
        atomicActions.dataReturned({
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        })
      );

      pickKeyedState(state).should.deepEqual({
        dataBySeriesId: {
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        },
        loadVersionBySeriesId: objectWithKeys(ALL_SERIES, null),
        errorBySeriesId: objectWithKeys(ALL_SERIES, null),
        yDomainBySeriesId: objectWithKeys(ALL_SERIES, DEFAULT_Y_DOMAIN)
      });
    });

    it('should clear the loading state and set the data for a single series that returns successfully', () => {
      state = serial(state,
        atomicActions.setSeriesIds(ALL_SERIES),
        atomicActions.dataRequested(ALL_SERIES),
        atomicActions.dataReturned({
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

    it('should clear the loading state, set the error state, and not change the data for all series when they return in error simultaneously', () => {
      state = serial(state,
        atomicActions.setSeriesIds(ALL_SERIES),
        atomicActions.dataRequested(ALL_SERIES),
        atomicActions.dataReturned({
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        }),
        atomicActions.dataRequested(ALL_SERIES),
        atomicActions.dataErrored(objectWithKeys(ALL_SERIES, ERROR))
      );

      pickKeyedState(state).should.deepEqual({
        dataBySeriesId: {
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        },
        loadVersionBySeriesId: objectWithKeys(ALL_SERIES, null),
        errorBySeriesId: objectWithKeys(ALL_SERIES, ERROR),
        yDomainBySeriesId: objectWithKeys(ALL_SERIES, DEFAULT_Y_DOMAIN)
      });
    });

    it('should clear the loading state, set the error state, and not change the data for a single series that returns in error', () => {
      state = serial(state,
        atomicActions.setSeriesIds(ALL_SERIES),
        atomicActions.dataRequested(ALL_SERIES),
        atomicActions.dataReturned({
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        }),
        atomicActions.dataRequested(ALL_SERIES),
        atomicActions.dataErrored({
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

  describe('(compound actions)', () => {

  });
});
