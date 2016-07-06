import * as _ from 'lodash';
import * as should from 'should';
import * as sinon from 'sinon';
import { applyMiddleware, createStore, Store } from 'redux';
import ThunkMiddleware from 'redux-thunk';

import reducer from '../src/connected/flux/reducer';
import { ChartState } from '../src/connected/model/state';
import {
  Action,
  setSeriesIds,
  setDataLoader,
  dataRequested,
  dataReturned,
  setYDomains,
  setOverrideXDomain,
  setOverrideYDomains
} from '../src/connected/flux/atomicActions';
import {
  setSeriesIdsAndLoad,
  setDataLoaderAndLoad,
  setXDomainAndLoad,
  setOverrideXDomainAndLoad,
  setChartPhysicalWidthAndLoad,
  _requestDataLoad,
  _performDataLoad,
  _makeKeyedDataBatcher
} from '../src/connected/flux/compoundActions';

function delay(timeout: number) {
  return () => new Promise((resolve, reject) => {
    setTimeout(resolve, timeout);
  });
}

describe('(action creator)', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const DATA_A = [{ __a: true }];
  const DATA_B = [{ __b: true }];
  const ALL_SERIES_IDS = [ SERIES_A, SERIES_B ];
  const DUMMY_DOMAIN = { min: -1, max: 1 };
  const DUMMY_DOMAIN_2 = { min: -10, max: 10 };

  let store: Store;
  let dataLoaderSpy: Sinon.SinonSpy;
  let dataLoaderStub: Sinon.SinonStub;

  beforeEach(() => {
    store = applyMiddleware(ThunkMiddleware)(createStore)(reducer);

    dataLoaderSpy = sinon.spy();
    dataLoaderStub = sinon.stub();

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
      store.dispatch(setXDomainAndLoad(DUMMY_DOMAIN));

      dataLoaderSpy.callCount.should.equal(1);
    });

    it('should not call the data loader with an override already set', () => {
      store.dispatch(setOverrideXDomain(DUMMY_DOMAIN));

      dataLoaderSpy.callCount.should.equal(0);

      store.dispatch(setXDomainAndLoad(DUMMY_DOMAIN));

      dataLoaderSpy.callCount.should.equal(0);
    });
  });

  describe('setOverrideXDomainAndLoad', () => {
    it('should call the data loader always', () => {
      store.dispatch(setXDomainAndLoad(DUMMY_DOMAIN));

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
      store.dispatch(dataRequested([ SERIES_A ]));
      store.dispatch(_performDataLoad());

      dataLoaderSpy.calledOnce.should.be.true();
      dataLoaderSpy.firstCall.args[0].should.deepEqual([ SERIES_A ]);
    });

    it('should call the data loader with the overridden X domain if one is set', () => {
      store.dispatch(setOverrideXDomain(DUMMY_DOMAIN));
      store.dispatch(dataRequested(ALL_SERIES_IDS));
      store.dispatch(_performDataLoad());

      dataLoaderSpy.calledOnce.should.be.true();
      dataLoaderSpy.firstCall.args[1].should.be.exactly(DUMMY_DOMAIN);
    });

    it('should call the data loader with the internal Y domains, even if an override is set', () => {
      store.dispatch(setYDomains({
        [SERIES_A]: DUMMY_DOMAIN,
        [SERIES_B]: DUMMY_DOMAIN
      }));
      store.dispatch(setOverrideYDomains({
        [SERIES_A]: DUMMY_DOMAIN_2,
        [SERIES_B]: DUMMY_DOMAIN_2
      }));
      store.dispatch(dataRequested(ALL_SERIES_IDS));
      store.dispatch(_performDataLoad());

      dataLoaderSpy.calledOnce.should.be.true();
      dataLoaderSpy.firstCall.args[2].should.deepEqual({
        [SERIES_A]: DUMMY_DOMAIN,
        [SERIES_B]: DUMMY_DOMAIN
      });
    });

    it('should set the data and Y domain as-is from the result of the data loader', () => {
      dataLoaderStub.onFirstCall().returns({
        [SERIES_A]: Promise.resolve({ data: DATA_A, yDomain: DUMMY_DOMAIN }),
        [SERIES_B]: Promise.resolve({ data: DATA_B, yDomain: DUMMY_DOMAIN })
      });

      store.dispatch(setDataLoader(dataLoaderStub));
      store.dispatch(dataRequested(ALL_SERIES_IDS));

      return store.dispatch(_performDataLoad(0))
      .then(delay(10))
      .then(() => {
        const state: ChartState = store.getState();

        state.loadVersionBySeriesId.should.deepEqual({
          [SERIES_A]: null,
          [SERIES_B]: null
        });

        state.dataBySeriesId.should.deepEqual({
          [SERIES_A]: DATA_A,
          [SERIES_B]: DATA_B
        });

        state.uiState.yDomainBySeriesId.should.deepEqual({
          [SERIES_A]: DUMMY_DOMAIN,
          [SERIES_B]: DUMMY_DOMAIN
        });
      });
    });

    it('should set the error as-is from the result of the data loader', () => {
      dataLoaderStub.onFirstCall().returns({
        [SERIES_A]: Promise.reject('a failed'),
        [SERIES_B]: Promise.reject('b failed')
      });

      store.dispatch(setDataLoader(dataLoaderStub));
      store.dispatch(dataRequested(ALL_SERIES_IDS));

      return store.dispatch(_performDataLoad(0))
      .then(delay(10))
      .then(() => {
        store.getState().errorBySeriesId.should.deepEqual({
          [SERIES_A]: 'a failed',
          [SERIES_B]: 'b failed'
        });
      });
    });

    it('should ignore results for series that have had another request come in before the load finishes', () => {
      dataLoaderStub.onFirstCall().returns({
        [SERIES_A]: Promise.resolve({ data: DATA_A }),
        [SERIES_B]: Promise.resolve({ data: DATA_B })
      });

      store.dispatch(setDataLoader(dataLoaderStub));
      store.dispatch(dataRequested(ALL_SERIES_IDS));

      const loadPromise = store.dispatch(_performDataLoad(0));

      store.dispatch(dataRequested([ SERIES_A ]));

      return loadPromise
      .then(delay(10))
      .then(() => {
        store.getState().dataBySeriesId.should.deepEqual({
          [SERIES_A]: [],
          [SERIES_B]: DATA_B
        });
      });
    });

    it('should ignore errors for series that have had another request come in before the load finishes', () => {
      dataLoaderStub.onFirstCall().returns({
        [SERIES_A]: Promise.reject('a failed'),
        [SERIES_B]: Promise.reject('b failed')
      });

      store.dispatch(setDataLoader(dataLoaderStub));
      store.dispatch(dataRequested(ALL_SERIES_IDS));

      const loadPromise = store.dispatch(_performDataLoad(0));

      store.dispatch(dataRequested([ SERIES_A ]));

      return loadPromise
      .then(delay(10))
      .then(() => {
        store.getState().errorBySeriesId.should.deepEqual({
          [SERIES_A]: null,
          [SERIES_B]: 'b failed'
        });
      });
    });
  });

  describe('_makeKeyedDataBatcher', () => {
    let batcher: Function;
    let callbackSpy: Sinon.SinonSpy;

    beforeEach(() => {
      callbackSpy = sinon.spy();
      batcher = _makeKeyedDataBatcher(callbackSpy, 10);
    });

    it('should not fire the callback before the timeout', () => {
      batcher({});

      return Promise.resolve()
      .then(delay(5))
      .then(() => {
        callbackSpy.callCount.should.equal(0);
      })
      .then(delay(5))
      .then(() => {
        callbackSpy.callCount.should.equal(1);
      });
    });

    it('should merge all the provided values shallowly into a single batch', () => {
      batcher({ a: 1 });
      batcher({ b: 2 });

      return Promise.resolve()
      .then(delay(10))
      .then(() => {
        callbackSpy.callCount.should.equal(1);
        callbackSpy.firstCall.args[0].should.deepEqual({ a: 1, b: 2 });
      });
    });
  });
});
