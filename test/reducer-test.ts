import * as _ from 'lodash';

import reducer, { objectWithKeys, replaceValuesWithConstant, objectWithKeysFromObject } from '../src/connected/flux/reducer';
import { ChartState, DEFAULT_CHART_STATE } from '../src/connected/model/state';
import { ActionType, Action } from '../src/connected/model/ActionType';
import { DEFAULT_Y_DOMAIN } from '../src/connected/model/constants';

function action<T>(actionType: ActionType, payload: T): Action<T> {
  return {
    type: actionType,
    payload
  };
}

function loadVersion() {
  return _.uniqueId('load-version-');
}

describe('objectWithKeys', () => {
  it('should yield an object with the specified keys', () => {
    objectWithKeys([ 'a', 'b' ], true).should.deepEqual({
      a: true,
      b: true
    });
  });

  // _.each early-aborts when you return false, which caused an issue earlier.
  it('should work as expected even when the value is false', () => {
    objectWithKeys([ 'a', 'b' ], false).should.deepEqual({
      a: false,
      b: false
    });
  });

  it('should not clone the default value for each key', () => {
    const { a, b } = objectWithKeys([ 'a', 'b' ], {});
    a.should.be.exactly(b);
  });
});

describe('replaceValuesWithConstant', () => {
  it('should replace all the values in the given object with the given value', () => {
    replaceValuesWithConstant({ a: 1, b: 2 }, true).should.deepEqual({
      a: true,
      b: true
    });
  });

  // _.each early-aborts when you return false, which caused an issue earlier.
  it('should work as expected even when the value is false', () => {
    replaceValuesWithConstant({ a: 1, b: 2 }, false).should.deepEqual({
      a: false,
      b: false
    });
  });

  it('should not mutate the input value', () => {
    const input = { a: 1 };
    const output = replaceValuesWithConstant(input, true);
    input.should.not.be.exactly(output);
    input.should.deepEqual({ a: 1 });
  });

  it('should not clone the default value for each key', () => {
    const { a, b } = replaceValuesWithConstant({ a: 1, b: 2 }, {});
    a.should.be.exactly(b);
  });
});

describe('objectWithKeysFromObject', () => {
  it('should add any missing keys using the default value', () => {
    objectWithKeysFromObject({}, [ 'a' ], true).should.deepEqual({
      a: true
    });
  });

  it('should remove any extraneous keys', () => {
    objectWithKeysFromObject({ a: 1 }, [], true).should.deepEqual({});
  });

  it('should add and remove keys as necessary, preferring the value of existing keys', () => {
    objectWithKeysFromObject({ a: 1, b: 2 }, [ 'b', 'c' ], true).should.deepEqual({
      b: 2,
      c: true
    });
  });

  // _.each early-aborts when you return false, which caused an issue earlier.
  it('should work as expected even when the value is false', () => {
    objectWithKeysFromObject({ a: false }, [ 'a' ], true).should.deepEqual({
      a: false
    });

    objectWithKeysFromObject({ a: true }, [ 'a' ], false).should.deepEqual({
      a: true
    });

    objectWithKeysFromObject({}, [ 'a' ], false).should.deepEqual({
      a: false
    });
  });

  it('should not mutate the input value', () => {
    const input = { a: 1 };
    const output = objectWithKeysFromObject(input, [ 'a' ], true);
    input.should.not.be.exactly(output);
    input.should.deepEqual({ a: 1 });
  });

  it('should not clone the default value for each key', () => {
    const { a, b } = objectWithKeysFromObject({}, [ 'a', 'b' ], {});
    a.should.be.exactly(b);
  });
});

describe('reducer', () => {
  const SERIES_A = 'a';
  const SERIES_B = 'b';
  const ALL_SERIES = [ SERIES_A, SERIES_B ];
  const DATA_A = [{ __a: true }];
  const DATA_B = [{ __b: true }];
  const ERROR = { __error: true };

  let state: ChartState;

  beforeEach(() => {
    state = DEFAULT_CHART_STATE;
  });

  function pickKeyedState(state: ChartState) {
    return {
      dataBySeriesId: state.dataBySeriesId,
      metadataBySeriesId: state.metadataBySeriesId,
      isLoadingBySeriesId: state.isLoadingBySeriesId,
      errorBySeriesId: state.errorBySeriesId,
      yDomainBySeriesId: state.uiState.yDomainBySeriesId
    };
  }

  function serial(state: ChartState, ...actions: Action<any>[]): ChartState {
    _.each(actions, action => state = reducer(state, action));
    return state;
  }

  it('should put defaults for all fields that are keyed by series ID', () => {
    state = reducer(state, action(ActionType.SET_SERIES_IDS, ALL_SERIES));

    state.seriesIds.should.deepEqual(ALL_SERIES);
    pickKeyedState(state).should.deepEqual({
      dataBySeriesId: objectWithKeys(ALL_SERIES, []),
      metadataBySeriesId: objectWithKeys(ALL_SERIES, {}),
      isLoadingBySeriesId: objectWithKeys(ALL_SERIES, false),
      errorBySeriesId: objectWithKeys(ALL_SERIES, null),
      yDomainBySeriesId: objectWithKeys(ALL_SERIES, DEFAULT_Y_DOMAIN)
    });
  });

  it('should remove outdated keys from fields that are keyed by series ID when resetting series ID', () => {
    const ONLY_SERIES_A = [ SERIES_A ];
    state = serial(state,
      action(ActionType.SET_SERIES_IDS, ALL_SERIES),
      action(ActionType.SET_SERIES_IDS, ONLY_SERIES_A)
    );

    state.seriesIds.should.deepEqual(ONLY_SERIES_A);
    pickKeyedState(state).should.deepEqual({
      dataBySeriesId: objectWithKeys(ONLY_SERIES_A, []),
      metadataBySeriesId: objectWithKeys(ONLY_SERIES_A, {}),
      isLoadingBySeriesId: objectWithKeys(ONLY_SERIES_A, false),
      errorBySeriesId: objectWithKeys(ONLY_SERIES_A, null),
      yDomainBySeriesId: objectWithKeys(ONLY_SERIES_A, DEFAULT_Y_DOMAIN)
    });
  });

  it('should not change anything except the loading state and load version when a load is requested', () => {
    state = reducer(state, action(ActionType.SET_SERIES_IDS, ALL_SERIES));

    const version = loadVersion();
    const startingState = state;

    state = reducer(state, action(ActionType.DATA_REQUESTED, version));

    _.omit(state, 'isLoadingBySeriesId', 'loadVersion').should.deepEqual(_.omit(startingState, 'isLoadingBySeriesId', 'loadVersion'));

    state.isLoadingBySeriesId.should.deepEqual(objectWithKeys(ALL_SERIES, true));
    state.loadVersion.should.equal(version);
  });

  it('should unset the loading state and set the data for all series when they return successfully simultaneously', () => {
    state = serial(state,
      action(ActionType.SET_SERIES_IDS, ALL_SERIES),
      action(ActionType.DATA_REQUESTED, loadVersion()),
      action(ActionType.DATA_RETURNED, {
        [SERIES_A]: DATA_A,
        [SERIES_B]: DATA_B
      })
    );

    pickKeyedState(state).should.deepEqual({
      dataBySeriesId: {
        [SERIES_A]: DATA_A,
        [SERIES_B]: DATA_B
      },
      isLoadingBySeriesId: objectWithKeys(ALL_SERIES, false),
      errorBySeriesId: objectWithKeys(ALL_SERIES, null),
      metadataBySeriesId: objectWithKeys(ALL_SERIES, {}),
      yDomainBySeriesId: objectWithKeys(ALL_SERIES, DEFAULT_Y_DOMAIN)
    });
  });

  it('should unset the loading state and set the data for a single series that returns successfully', () => {
    state = serial(state,
      action(ActionType.SET_SERIES_IDS, ALL_SERIES),
      action(ActionType.DATA_REQUESTED, loadVersion()),
      action(ActionType.DATA_RETURNED, {
        [SERIES_A]: DATA_A
      })
    );

    pickKeyedState(state).should.deepEqual({
      dataBySeriesId: {
        [SERIES_A]: DATA_A,
        [SERIES_B]: []
      },
      isLoadingBySeriesId: {
        [SERIES_A]: false,
        [SERIES_B]: true
      },
      errorBySeriesId: objectWithKeys(ALL_SERIES, null),
      metadataBySeriesId: objectWithKeys(ALL_SERIES, {}),
      yDomainBySeriesId: objectWithKeys(ALL_SERIES, DEFAULT_Y_DOMAIN)
    });
  });

  it('should unset the loading state, set the error state, and not change the data for all series when they return in error simultaneously', () => {
    state = serial(state,
      action(ActionType.SET_SERIES_IDS, ALL_SERIES),
      action(ActionType.DATA_REQUESTED, loadVersion()),
      action(ActionType.DATA_RETURNED, {
        [SERIES_A]: DATA_A,
        [SERIES_B]: DATA_B
      }),
      action(ActionType.DATA_REQUESTED, loadVersion()),
      action(ActionType.DATA_ERRORED, objectWithKeys(ALL_SERIES, ERROR))
    );

    pickKeyedState(state).should.deepEqual({
      dataBySeriesId: {
        [SERIES_A]: DATA_A,
        [SERIES_B]: DATA_B
      },
      isLoadingBySeriesId: objectWithKeys(ALL_SERIES, false),
      errorBySeriesId: objectWithKeys(ALL_SERIES, ERROR),
      metadataBySeriesId: objectWithKeys(ALL_SERIES, {}),
      yDomainBySeriesId: objectWithKeys(ALL_SERIES, DEFAULT_Y_DOMAIN)
    });
  });

  it('should unset the loading state, set the error state, and not change the data for a single series that returns in error', () => {
    state = serial(state,
      action(ActionType.SET_SERIES_IDS, ALL_SERIES),
      action(ActionType.DATA_REQUESTED, loadVersion()),
      action(ActionType.DATA_RETURNED, {
        [SERIES_A]: DATA_A,
        [SERIES_B]: DATA_B
      }),
      action(ActionType.DATA_REQUESTED, loadVersion()),
      action(ActionType.DATA_ERRORED, {
        [SERIES_A]: ERROR
      })
    );

    pickKeyedState(state).should.deepEqual({
      dataBySeriesId: {
        [SERIES_A]: DATA_A,
        [SERIES_B]: DATA_B
      },
      isLoadingBySeriesId: {
        [SERIES_A]: false,
        [SERIES_B]: true
      },
      errorBySeriesId: {
        [SERIES_A]: ERROR,
        [SERIES_B]: null
      },
      metadataBySeriesId: objectWithKeys(ALL_SERIES, {}),
      yDomainBySeriesId: objectWithKeys(ALL_SERIES, DEFAULT_Y_DOMAIN)
    });
  });

});
