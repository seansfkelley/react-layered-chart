import * as _ from 'lodash';
import * as should from 'should';
import { applyMiddleware, createStore, Store } from 'redux';
import ThunkMiddleware from 'redux-thunk';

import reducer from '../src/connected/flux/reducer';
import { requestDataLoad, setSeriesIds, setDataLoader } from '../src/connected/flux/dataActions';
import { ActionType } from '../src/connected/model/ActionType';
import { ChartState } from '../src/connected/model/state';

describe('(action creator)', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const ALL_SERIES = [ SERIES_A, SERIES_B ];

  let store: Store;

  beforeEach(() => {
    store = applyMiddleware(ThunkMiddleware)(createStore)(reducer);

    store.dispatch({
      type: ActionType.SET_DATA_LOADER,
      payload: () => {}
    });

    store.dispatch({
      type: ActionType.SET_SERIES_IDS,
      payload: ALL_SERIES
    });

    store.dispatch({
      type: ActionType.DATA_RETURNED,
      payload: {
        [SERIES_A]: [],
        [SERIES_B]: []
      }
    });
  });

  describe('test suite', () => {
    it('should be initialized with two series with no pending loads, data or errors', () => {
      const state: ChartState = store.getState();

      state.seriesIds.should.deepEqual(ALL_SERIES);
      state.loadVersionBySeriesId.should.deepEqual({
        [SERIES_A]: null,
        [SERIES_B]: null
      });
      state.dataBySeriesId.should.deepEqual({
        [SERIES_A]: [],
        [SERIES_B]: []
      });
      state.errorBySeriesId.should.deepEqual({
        [SERIES_A]: null,
        [SERIES_B]: null
      });
    });
  });

  describe('setSeriesIds', () => {
    it('should request a data load for any series that didn\'t already exist', () => {
      const SERIES_C = 'c';

      store.dispatch(setSeriesIds([ SERIES_C ].concat(ALL_SERIES)));

      const state: ChartState = store.getState();

      should(state.loadVersionBySeriesId[SERIES_A]).be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).be.null();
      should(state.loadVersionBySeriesId[SERIES_C]).not.be.null();
    });
  });

  describe('setDataLoader', () => {
    it('should request a data load for all existing series', () => {
      store.dispatch(setDataLoader((() => {}) as any));

      const state: ChartState = store.getState();

      should(state.loadVersionBySeriesId[SERIES_A]).not.be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).not.be.null();
    });
  });

  describe('requestDataLoad', () => {
    it('should request data for all existing series if no parameter is provided', () => {
      store.dispatch(requestDataLoad());

      const state: ChartState = store.getState();

      should(state.loadVersionBySeriesId[SERIES_A]).not.be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).not.be.null();
    });

    it('should request data for the provided series IDs if they exist in the store', () => {
      store.dispatch(requestDataLoad([ SERIES_A ]));

      const state: ChartState = store.getState();

      should(state.loadVersionBySeriesId[SERIES_A]).not.be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).be.null();
    });

    it('should not request loads for series IDs that are not in the store', () => {
      const SERIES_C = 'c';

      store.dispatch(requestDataLoad([SERIES_C]));

      const state: ChartState = store.getState();

      state.loadVersionBySeriesId.should.not.have.key(SERIES_C);
    });
  });
});
