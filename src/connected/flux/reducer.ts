import * as _ from 'lodash';
import update = require('immutability-helper');

import { ActionType, Action } from '../model/ActionType';
import { ChartState, DEFAULT_CHART_STATE } from '../model/state';
import computedChannelsLoader from '../flux/computedChannelsLoader';
import { TBySeriesId } from '../model/typedefs';
import { DEFAULT_Y_DOMAIN } from '../model/constants';

// Exported for testing.
export function objectWithKeys<T>(keys: string[], value: T): { [key: string]: T } {
  const object: { [key: string]: T } = {};
  _.each(keys, k => { object[k] = value });
  return object;
}

// Exported for testing.
export function replaceValuesWithConstant<T>(anyBySeriesId: TBySeriesId<any>, value: T): TBySeriesId<T> {
  return _.mapValues(anyBySeriesId, _.constant(value));
}

// Exported for testing.
export function objectWithKeysFromObject<T>(anyBySeriesId: TBySeriesId<any>, keys: string[], defaultValue: T): TBySeriesId<T> {
  const object: { [key: string]: T } = {};
  _.each(keys, k => { object[k] = anyBySeriesId[k] !== undefined ? anyBySeriesId[k] : defaultValue });
  return object;
}

export default function(state: ChartState, action: Action<any>): ChartState {
  if (state === undefined) {
    return DEFAULT_CHART_STATE;
  }

  function createConstantMapForAllSeries<T>(value: T): TBySeriesId<T> {
    return objectWithKeys(state.seriesIds, value);
  }

  switch (action.type) {
    case ActionType.SET_SERIES_IDS:
    {
      const seriesIds = _.clone(action.payload);
      return update(state, {
        seriesIds: { $set: seriesIds },
        dataBySeriesId: { $set: objectWithKeysFromObject(state.dataBySeriesId, seriesIds, []) },
        metadataBySeriesId: { $set: objectWithKeysFromObject(state.metadataBySeriesId, seriesIds, {}) },
        isLoadingBySeriesId: { $set: objectWithKeysFromObject(state.isLoadingBySeriesId, seriesIds, false) },
        errorBySeriesId: { $set: objectWithKeysFromObject(state.errorBySeriesId, seriesIds, null) },
        uiState: {
          yDomainBySeriesId: { $set: objectWithKeysFromObject(state.uiState.yDomainBySeriesId, seriesIds, DEFAULT_Y_DOMAIN) }
        }
      });
    }

    case ActionType.SET_METADATA:
      return update(state, {
        // TODO: This should be shallow-merged.
        metadataBySeriesId: { $merge: action.payload }
      });

    case ActionType.DATA_REQUESTED:
      // TODO: Should we merge load state and load version?
      // TODO: This assumes that when you request a load, you request it for everything. This may not be true.
      return update(state, {
        isLoadingBySeriesId: { $merge: createConstantMapForAllSeries(true) },
        loadVersion: { $set: action.payload }
      });

    case ActionType.DATA_RETURNED:
      return update(state, {
        dataBySeriesId: { $merge: action.payload },
        isLoadingBySeriesId: { $merge: replaceValuesWithConstant(action.payload, false) },
        errorBySeriesId: { $merge: replaceValuesWithConstant(action.payload, null) }
      });

    case ActionType.DATA_ERRORED:
      // TODO: Should we clear the current data too?
      return update(state, {
        isLoadingBySeriesId: { $merge: replaceValuesWithConstant(action.payload, false) },
        errorBySeriesId: { $merge: action.payload }
      });

    case ActionType.SET_DATA_LOADER:
      return update(state, {
        dataLoader: { $set: action.payload || computedChannelsLoader }
      });

    case ActionType.SET_CHART_PHYSICAL_WIDTH:
      return update(state, {
        physicalChartWidth: { $set: action.payload }
      });

    case ActionType.SET_X_DOMAIN:
      return update(state, {
        uiState: {
          xDomain: { $set: _.clone(action.payload) }
        }
      });

    case ActionType.SET_OVERRIDE_X_DOMAIN:
      if (action.payload) {
        return update(state, {
          uiStateConsumerOverrides: {
            xDomain: { $set: _.clone(action.payload) }
          }
        });
      } else {
        return update(state, {
          uiStateConsumerOverrides: {
            xDomain: { $set: null }
          }
        });
      }

    case ActionType.SET_Y_DOMAINS:
      return update(state, {
        uiState: {
          // TODO: This should be shallow-merged.
          yDomainBySeriesId: { $merge: action.payload }
        }
      });

    case ActionType.SET_OVERRIDE_Y_DOMAINS:
      if (action.payload) {
        return update(state, {
          uiStateConsumerOverrides: {
            yDomainBySeriesId: { $set: action.payload }
          }
        });
      } else {
        return update(state, {
          uiStateConsumerOverrides: {
            yDomainBySeriesId: { $set: null }
          }
        });
      }

    case ActionType.SET_HOVER:
      return update(state, {
        uiState: {
          hover: { $set: action.payload }
        }
      });

    case ActionType.SET_OVERRIDE_HOVER:
      if (_.isNumber(action.payload)) {
        return update(state, {
          uiStateConsumerOverrides: {
            hover: { $set: action.payload }
          }
        });
      } else {
        return update(state, {
          uiStateConsumerOverrides: {
            hover: { $set: null }
          }
        });
      }

    case ActionType.SET_SELECTION:
      return update(state, {
        uiState: {
          selection: { $set: _.clone(action.payload) }
        }
      });

    case ActionType.SET_OVERRIDE_SELECTION:
      if (action.payload) {
        return update(state, {
          uiStateConsumerOverrides: {
            selection: { $set: _.clone(action.payload) }
          }
        });
      } else {
        return update(state, {
          uiStateConsumerOverrides: {
            selection: { $set: null }
          }
        });
      }

    default:
      return state;
  }
}
