import * as _ from 'lodash';
import * as should from 'should';
import * as sinon from 'sinon';
import { applyMiddleware, createStore, Store } from 'redux';
import ThunkMiddleware from 'redux-thunk';

import reducer from '../src/connected/flux/reducer';
import {
  setSeriesIds,
  setDataLoader,
  dataReturned,
  setOverrideXDomain
} from '../src/connected/flux/atomicActions';
import {
  setSeriesIdsAndLoad,
  setDataLoaderAndLoad,
  setXDomainAndLoad,
  setOverrideXDomainAndLoad,
  setChartPhysicalWidthAndLoad,
  _requestDataLoad,
  _performDataLoad,
  _BATCH_DURATION
} from '../src/connected/flux/compoundActions';
import { ActionType } from '../src/connected/model/ActionType';
import { ChartState } from '../src/connected/model/state';

describe('(action creator)', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const ALL_SERIES_IDS = [ SERIES_A, SERIES_B ];
  const REQUEST_X_DOMAIN = { min: 0, max: 10 };

  let store: Store;
  let dataLoaderSpy: Sinon.SinonSpy;

  beforeEach(() => {
    store = applyMiddleware(ThunkMiddleware)(createStore)(reducer);

    dataLoaderSpy = sinon.spy();

    store.dispatch(setDataLoader(dataLoaderSpy));
    store.dispatch(setSeriesIds(ALL_SERIES_IDS));
    store.dispatch(dataReturned({
      [SERIES_A]: [],
      [SERIES_B]: []
    }));
  });

  describe('(meta: test suite)', () => {
    it('should be initialized with two series with no pending loads, data, errors and no load invocations', () => {
      const state: ChartState = store.getState();

      state.seriesIds.should.deepEqual(ALL_SERIES_IDS);
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

      dataLoaderSpy.callCount.should.equal(0);
    });
  });

  describe('setSeriesIdsAndLoad', () => {
    it('should request a data load for any series that didn\'t already exist', () => {
      const SERIES_C = 'c';

      store.dispatch(setSeriesIdsAndLoad([ SERIES_C ].concat(ALL_SERIES_IDS)));

      const state: ChartState = store.getState();

      should(state.loadVersionBySeriesId[SERIES_A]).be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).be.null();
      should(state.loadVersionBySeriesId[SERIES_C]).not.be.null();

      dataLoaderSpy.callCount.should.equal(1);
    });
  });

  describe('setDataLoaderAndLoad', () => {
    it('should request a data load for all existing series', () => {
      store.dispatch(setDataLoaderAndLoad((() => {}) as any));

      const state: ChartState = store.getState();

      should(state.loadVersionBySeriesId[SERIES_A]).not.be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).not.be.null();
    });
  });

  describe('setXDomainAndLoad', () => {
    it('should call the data loader when there is no override set', () => {
      store.dispatch(setXDomainAndLoad(REQUEST_X_DOMAIN));

      dataLoaderSpy.callCount.should.equal(1);
    });

    it('should not call the data loader with an override already set', () => {
      store.dispatch(setOverrideXDomain(REQUEST_X_DOMAIN));

      dataLoaderSpy.callCount.should.equal(0);

      store.dispatch(setXDomainAndLoad(REQUEST_X_DOMAIN));

      dataLoaderSpy.callCount.should.equal(0);
    });
  });

  describe('setOverrideXDomainAndLoad', () => {
    it('should call the data loader always', () => {
      store.dispatch(setXDomainAndLoad(REQUEST_X_DOMAIN));

      dataLoaderSpy.callCount.should.equal(1);
    });
  });

  describe('setChartPhysicalWidthAndLoad', () => {
    it('should call the data loader always', () => {
      store.dispatch(setChartPhysicalWidthAndLoad(1337));

      dataLoaderSpy.callCount.should.equal(1);
    });
  });

  describe('_requestDataLoad', () => {
    it('should mark data requested for all existing series if no parameter is provided', () => {
      store.dispatch(_requestDataLoad());

      const state: ChartState = store.getState();

      should(state.loadVersionBySeriesId[SERIES_A]).not.be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).not.be.null();
    });

    it('should mark data requested for the provided series IDs if they exist in the store', () => {
      store.dispatch(_requestDataLoad([ SERIES_A ]));

      const state: ChartState = store.getState();

      should(state.loadVersionBySeriesId[SERIES_A]).not.be.null();
      should(state.loadVersionBySeriesId[SERIES_B]).be.null();
    });

    it('should not mark data requested for series IDs that are not in the store', () => {
      const SERIES_C = 'c';

      store.dispatch(_requestDataLoad([SERIES_C]));

      const state: ChartState = store.getState();

      state.loadVersionBySeriesId.should.not.have.key(SERIES_C);
    });

    it('should call the data loader', () => {
      store.dispatch(_requestDataLoad());

      dataLoaderSpy.calledOnce.should.be.true();
    });
  });

  describe('_performDataLoad', () => {
    it('should provide debounce metadata', () => {
      const action = _performDataLoad();
      should.exist(action.meta);
      should.exist(action.meta.debounce);
      should(action.meta.debounce.time).be.a.Number();
      should(action.meta.debounce.key).be.a.String();
    });

    it('should call the data loader with only the series IDs that have requested loads', () => {
      store.dispatch({
        type: ActionType.DATA_REQUESTED,
        payload: [ SERIES_A ]
      });
      store.dispatch(_performDataLoad());

      dataLoaderSpy.calledOnce.should.be.true();
      dataLoaderSpy.firstCall.args[0].should.deepEqual([ SERIES_A ]);
    });

    it('should call the data loader with the overridden X domain if one is set');

    it('should call the data loader with the internal Y domains, even if an override is set');

    it('should ignore results for series that have had another request come in before the load finishes');

    it('should ignore errors for series that have had another request come in before the load finishes');

    it('should batch up firing actions for results that arrive in quick succession');
  });

  describe('_makeKeyedDataBatcher', () => {
    it('should not fire the callback immediately');

    it(`should fire the callback every ${_BATCH_DURATION}ms as long as it keeps getting called`);

    it('should merge all the provided values shallowly into a single batch');

    it('should not merge two batches together if the callback calls the batcher');
  });
});
