import * as _ from 'lodash';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { applyMiddleware, createStore, Store } from 'redux';
import ThunkMiddleware from 'redux-thunk';

import reducer from '../src/connected/flux/reducer';
import { DataLoader } from '../src/connected/interfaces';
import { ChartState } from '../src/connected/model/state';
import { DEFAULT_Y_DOMAIN } from '../src/connected/model/constants';
import {
  setSeriesIds,
  setDataLoader,
  setDataLoaderDebounceTimeout,
  setDataLoaderContext,
  dataRequested,
  dataReturned,
  setYDomains,
  setOverrideXDomain,
  setOverrideYDomains
} from '../src/connected/flux/atomicActions';
import {
  setSeriesIdsAndLoad,
  setDataLoaderAndLoad,
  setDataLoaderContextAndLoad,
  setXDomainAndLoad,
  setOverrideXDomainAndLoad,
  setChartPhysicalWidthAndLoad,
  _requestDataLoad,
  _performDataLoad,
  _makeKeyedDataBatcher
} from '../src/connected/flux/compoundActions';

function delay(timeout: number) {
  return () => new Promise((resolve, _reject) => {
    setTimeout(resolve, timeout);
  });
}

describe('(compound actions)', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const DATA_A = [{ __a: true }];
  const DATA_B = [{ __b: true }];
  const ALL_SERIES_IDS = [ SERIES_A, SERIES_B ];
  const DUMMY_DOMAIN = { min: -1, max: 1 };
  const DUMMY_DOMAIN_2 = { min: -10, max: 10 };

  let store: Store<ChartState>;
  let state: ChartState;
  let dataLoaderSpy: sinon.SinonSpy;
  let dataLoaderStub: sinon.SinonStub;

  beforeEach(() => {
    store = applyMiddleware(ThunkMiddleware)(createStore)(reducer);

    dataLoaderSpy = sinon.spy();
    dataLoaderStub = sinon.stub();

    store.dispatch(setDataLoader(dataLoaderSpy));
    store.dispatch(setSeriesIds(ALL_SERIES_IDS));
    store.dispatch(dataReturned({
      [SERIES_A]: {
        data: [],
        yDomain: DEFAULT_Y_DOMAIN
      },
      [SERIES_B]: {
        data: [],
        yDomain: DEFAULT_Y_DOMAIN
      }
    }));
  });

  describe('(meta: test suite)', () => {
    it('should be initialized with two series with no pending loads, data, errors, load invocations or context', () => {
      state = store.getState();

      expect(state.seriesIds).to.deep.equal(ALL_SERIES_IDS);
      expect(state.loadVersionBySeriesId).to.deep.equal({
        [SERIES_A]: null,
        [SERIES_B]: null
      });
      expect(state.loadedDataBySeriesId).to.deep.equal({
        [SERIES_A]: {
          data: [],
          yDomain: DEFAULT_Y_DOMAIN
        },
        [SERIES_B]: {
          data: [],
          yDomain: DEFAULT_Y_DOMAIN
        }
      });
      expect(state.errorBySeriesId).to.deep.equal({
        [SERIES_A]: null,
        [SERIES_B]: null
      });
      expect(state.loaderContext).to.be.undefined;

      expect(dataLoaderSpy.callCount).to.equal(0);
    });
  });

  describe('setSeriesIdsAndLoad', () => {
    it('should request a data load for any series that didn\'t already exist', () => {
      const SERIES_C = 'c';

      store.dispatch(setSeriesIdsAndLoad([ SERIES_C ].concat(ALL_SERIES_IDS)));

      state = store.getState();

      expect(state.loadVersionBySeriesId[SERIES_A]).to.be.null;
      expect(state.loadVersionBySeriesId[SERIES_B]).to.be.null;
      expect(state.loadVersionBySeriesId[SERIES_C]).to.not.be.null;

      expect(dataLoaderSpy.callCount).to.equal(1);
    });

    it('should not change state and not call the data loader if the series IDs are deep equal', () => {
      state = store.getState();

      store.dispatch(setSeriesIdsAndLoad(_.clone(ALL_SERIES_IDS)));

      const newState: ChartState = store.getState();

      expect(state).to.equal(newState);
      expect(dataLoaderSpy.callCount).to.equal(0);
    });

    it('should not change state and not call the data loader if the series ID are equal but in a different order', () => {
      state = store.getState();

      store.dispatch(setSeriesIdsAndLoad(_.clone(ALL_SERIES_IDS).reverse()));

      const newState: ChartState = store.getState();

      expect(state).to.equal(newState);
      expect(dataLoaderSpy.callCount).to.equal(0);
    });
  });

  describe('setDataLoaderAndLoad', () => {
    const LOADER: DataLoader = (() => {}) as any;

    it('should request a data load for all existing series', () => {
      store.dispatch(setDataLoaderAndLoad(LOADER));

      state = store.getState();

      expect(state.loadVersionBySeriesId[SERIES_A]).to.not.be.null;
      expect(state.loadVersionBySeriesId[SERIES_B]).to.not.be.null;
    });

    it('should not change state and not call the data loader if the data loader is reference equal', () => {
      store.dispatch(setDataLoader(LOADER));

      state = store.getState();
      expect(state.dataLoader).to.equal(LOADER);

      store.dispatch(setDataLoaderAndLoad(state.dataLoader));

      const newState: ChartState = store.getState();

      expect(state).to.equal(newState);
      expect(dataLoaderSpy.callCount).to.equal(0);
    });
  });

  describe('setDataLoaderContextAndLoad', () => {
    const CONTEXT = { foo: 'bar' };

    it('should call the data loader', () => {
      store.dispatch(setDataLoaderContextAndLoad(CONTEXT));

      expect(dataLoaderSpy.callCount).to.equal(1);
    });

    it('should not change state and not call the data loader if the value is reference-equals to the current value', () => {
      store.dispatch(setDataLoaderContext(CONTEXT));
      expect(dataLoaderSpy.callCount).to.equal(0);

      state = store.getState();

      store.dispatch(setDataLoaderContextAndLoad(CONTEXT));

      const newState: ChartState = store.getState();

      expect(state).to.equal(newState);
      expect(dataLoaderSpy.callCount).to.equal(0);
    });
  });

  describe('setXDomainAndLoad', () => {
    it('should call the data loader when there is no override set', () => {
      store.dispatch(setXDomainAndLoad(DUMMY_DOMAIN));

      expect(dataLoaderSpy.callCount).to.equal(1);
    });

    it('should not call the data loader with an override already set', () => {
      store.dispatch(setOverrideXDomain(DUMMY_DOMAIN));

      expect(dataLoaderSpy.callCount).to.equal(0);

      store.dispatch(setXDomainAndLoad(DUMMY_DOMAIN));

      expect(dataLoaderSpy.callCount).to.equal(0);
    });

    it('should not change state and not call the data loader if the X domain is deep-equal to the current internal value', () => {
      state = store.getState();

      store.dispatch(setXDomainAndLoad(_.clone(state.uiState.xDomain)));

      const newState: ChartState = store.getState();

      expect(state).to.equal(newState);
      expect(dataLoaderSpy.callCount).to.equal(0);
    });
  });

  describe('setOverrideXDomainAndLoad', () => {
    it('should call the data loader', () => {
      store.dispatch(setOverrideXDomainAndLoad(DUMMY_DOMAIN));

      expect(dataLoaderSpy.callCount).to.equal(1);
    });

    it('should not change state and not call the data loader if the X domain is deep-equal to the current override value', () => {
      store.dispatch(setOverrideXDomainAndLoad(DUMMY_DOMAIN));

      expect(dataLoaderSpy.callCount).to.equal(1);

      state = store.getState();

      store.dispatch(setOverrideXDomainAndLoad(_.clone(state.uiStateConsumerOverrides.xDomain)));

      const newState: ChartState = store.getState();

      expect(state).to.equal(newState);
      expect(dataLoaderSpy.callCount).to.equal(1);
    });
  });

  describe('setChartPhysicalWidthAndLoad', () => {
    it('should call the data loader', () => {
      store.dispatch(setChartPhysicalWidthAndLoad(1337));

      expect(dataLoaderSpy.callCount).to.equal(1);
    });

    it('should not change state and not call the data loader if the value is the same as the current value', () => {
      state = store.getState();

      store.dispatch(setChartPhysicalWidthAndLoad(state.physicalChartWidth));

      const newState: ChartState = store.getState();

      expect(state).to.equal(newState);
      expect(dataLoaderSpy.callCount).to.equal(0);
    });
  });

  describe('_requestDataLoad', () => {
    it('should mark data requested for all existing series if no parameter is provided', () => {
      store.dispatch(_requestDataLoad());

      state = store.getState();

      expect(state.loadVersionBySeriesId[SERIES_A]).to.not.be.null;
      expect(state.loadVersionBySeriesId[SERIES_B]).to.not.be.null;
    });

    it('should mark data requested for the provided series IDs if they exist in the store', () => {
      store.dispatch(_requestDataLoad([ SERIES_A ]));

      state = store.getState();

      expect(state.loadVersionBySeriesId[SERIES_A]).to.not.be.null;
      expect(state.loadVersionBySeriesId[SERIES_B]).to.be.null;
    });

    it('should not mark data requested for series IDs that are not in the store', () => {
      const SERIES_C = 'c';

      store.dispatch(_requestDataLoad([SERIES_C]));

      state = store.getState();

      expect(state.loadVersionBySeriesId).to.not.have.key(SERIES_C);
    });

    it('should call the data loader', () => {
      store.dispatch(_requestDataLoad());

      expect(dataLoaderSpy.calledOnce).to.be.true;
    });
  });

  describe('_performDataLoad', () => {
    it('should provide debounce metadata', () => {
      const action = _performDataLoad()(_.identity, () => ({ debounceTimeout: 1000 }) as ChartState);
      expect(action.meta).to.exist;
      expect(action.meta.debounce).to.exist;
      expect(action.meta.debounce.time).to.be.a('number');
      expect(action.meta.debounce.key).to.be.a('string');
    });

    it('should respect the debounce timeout set on the store', () => {
      store.dispatch(setDataLoaderDebounceTimeout(1337));

      const action = _performDataLoad()(_.identity, store.getState);
      expect(action.meta).to.exist;
      expect(action.meta.debounce).to.exist;
      expect(action.meta.debounce.time).to.equal(1337);
    });

    it('should use a debounce timeout of 1 if the store specifies a value of 0', () => {
      store.dispatch(setDataLoaderDebounceTimeout(0));

      const action = _performDataLoad()(_.identity, store.getState);
      expect(action.meta).to.exist;
      expect(action.meta.debounce).to.exist;
      expect(action.meta.debounce.time).to.equal(1);
    });

    it('should call the data loader with only the series IDs that have requested loads', () => {
      store.dispatch(dataRequested([ SERIES_A ]));
      store.dispatch(_performDataLoad());

      expect(dataLoaderSpy.calledOnce).to.be.true;
      expect(dataLoaderSpy.firstCall.args[0]).to.deep.equal([ SERIES_A ]);
    });

    it('should call the data loader with the overridden X domain if one is set', () => {
      store.dispatch(setOverrideXDomain(DUMMY_DOMAIN));
      store.dispatch(dataRequested(ALL_SERIES_IDS));
      store.dispatch(_performDataLoad());

      expect(dataLoaderSpy.calledOnce).to.be.true;
      expect(dataLoaderSpy.firstCall.args[1]).to.equal(DUMMY_DOMAIN);
    });

    it('should call the data loader with the previously-loaded data + Y domains', () => {
      store.dispatch(dataRequested(ALL_SERIES_IDS));
      store.dispatch(_performDataLoad());

      expect(dataLoaderSpy.calledOnce).to.be.true;
      expect(dataLoaderSpy.firstCall.args[3]).to.deep.equal({
        [SERIES_A]: {
          data: [],
          yDomain: DEFAULT_Y_DOMAIN
        },
        [SERIES_B]: {
          data: [],
          yDomain: DEFAULT_Y_DOMAIN
        }
      });
    });

    it('should call the data loader with the previously-loaded data + Y domains, even if an override is set', () => {
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

      expect(dataLoaderSpy.calledOnce).to.be.true;
      expect(dataLoaderSpy.firstCall.args[3]).to.deep.equal({
        [SERIES_A]: {
          data: [],
          yDomain: DEFAULT_Y_DOMAIN
        },
        [SERIES_B]: {
          data: [],
          yDomain: DEFAULT_Y_DOMAIN
        }
      });
    });

    it('should call the data loader with the loader context', () => {
      const CONTEXT = { foo: 'bar' };

      store.dispatch(setDataLoaderContext(CONTEXT));
      store.dispatch(_performDataLoad());

      expect(dataLoaderSpy.calledOnce).to.be.true;
      expect(dataLoaderSpy.firstCall.args[4]).to.equal(CONTEXT);
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
        state = store.getState();

        expect(state.loadVersionBySeriesId).to.deep.equal({
          [SERIES_A]: null,
          [SERIES_B]: null
        });

        expect(state.loadedDataBySeriesId).to.deep.equal({
          [SERIES_A]: {
            data: DATA_A,
            yDomain: DUMMY_DOMAIN
          },
          [SERIES_B]: {
            data: DATA_B,
            yDomain: DUMMY_DOMAIN
          }
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
        expect(store.getState().errorBySeriesId).to.deep.equal({
          [SERIES_A]: 'a failed',
          [SERIES_B]: 'b failed'
        });
      });
    });

    it('should ignore results for series that have had another request come in before the load finishes', () => {
      dataLoaderStub.onFirstCall().returns({
        [SERIES_A]: Promise.resolve({ data: DATA_A, yDomain: DUMMY_DOMAIN }),
        [SERIES_B]: Promise.resolve({ data: DATA_B, yDomain: DUMMY_DOMAIN })
      });

      store.dispatch(setDataLoader(dataLoaderStub));
      store.dispatch(dataRequested(ALL_SERIES_IDS));

      const loadPromise = store.dispatch(_performDataLoad(0));

      store.dispatch(dataRequested([ SERIES_A ]));

      return loadPromise
      .then(delay(10))
      .then(() => {
        expect(store.getState().loadedDataBySeriesId).to.deep.equal({
          [SERIES_A]: {
            data: [],
            yDomain: DEFAULT_Y_DOMAIN
          },
          [SERIES_B]: {
            data: DATA_B,
            yDomain: DUMMY_DOMAIN
          }
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
        expect(store.getState().errorBySeriesId).to.deep.equal({
          [SERIES_A]: null,
          [SERIES_B]: 'b failed'
        });
      });
    });
  });

  describe('_makeKeyedDataBatcher', () => {
    let batcher: Function;
    let callbackSpy: sinon.SinonSpy;

    beforeEach(() => {
      callbackSpy = sinon.spy();
      batcher = _makeKeyedDataBatcher(callbackSpy, 10);
    });

    it('should not fire the callback before the timeout', () => {
      batcher({});

      return Promise.resolve()
      .then(delay(5))
      .then(() => {
        expect(callbackSpy.callCount).to.equal(0);
      })
      .then(delay(10))
      .then(() => {
        expect(callbackSpy.callCount).to.equal(1);
      });
    });

    it('should merge all the provided values shallowly into a single batch', () => {
      batcher({ a: 1 });
      batcher({ b: 2 });

      return Promise.resolve()
      .then(delay(15))
      .then(() => {
        expect(callbackSpy.callCount).to.equal(1);
        expect(callbackSpy.firstCall.args[0]).to.deep.equal({ a: 1, b: 2 });
      });
    });
  });
});
