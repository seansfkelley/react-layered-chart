import { Interval } from '../../core/interfaces';
import { SeriesId, TBySeriesId, DataLoader, LoadedSeriesData } from '../interfaces';

export enum ActionType {
  DATA_REQUESTED = 1,
  DATA_RETURNED,
  DATA_ERRORED,
  SET_SERIES_IDS,
  SET_DATA_LOADER,
  SET_DATA_LOADER_DEBOUNCE_TIMEOUT,
  SET_DATA_LOADER_CONTEXT,
  SET_X_DOMAIN,
  SET_OVERRIDE_X_DOMAIN,
  SET_Y_DOMAINS,
  SET_OVERRIDE_Y_DOMAINS,
  SET_HOVER,
  SET_OVERRIDE_HOVER,
  SET_SELECTION,
  SET_OVERRIDE_SELECTION,
  SET_CHART_PHYSICAL_WIDTH
}

export interface Action<P> {
  type: ActionType;
  payload: P;
}

function createActionCreator<P>(type: ActionType) {
  return function(payload: P): Action<P> {
    return { type, payload };
  };
}

export const setSeriesIds = createActionCreator<SeriesId[]>(ActionType.SET_SERIES_IDS);
export const setDataLoader = createActionCreator<DataLoader>(ActionType.SET_DATA_LOADER);
export const setDataLoaderDebounceTimeout = createActionCreator<number>(ActionType.SET_DATA_LOADER_DEBOUNCE_TIMEOUT);
export const setDataLoaderContext = createActionCreator<any>(ActionType.SET_DATA_LOADER_CONTEXT);
export const setChartPhysicalWidth = createActionCreator<number>(ActionType.SET_CHART_PHYSICAL_WIDTH);

export const setXDomain = createActionCreator<Interval>(ActionType.SET_X_DOMAIN);
export const setOverrideXDomain = createActionCreator<Interval>(ActionType.SET_OVERRIDE_X_DOMAIN);
export const setYDomains = createActionCreator<TBySeriesId<Interval>>(ActionType.SET_Y_DOMAINS);
export const setOverrideYDomains = createActionCreator<TBySeriesId<Interval>>(ActionType.SET_OVERRIDE_Y_DOMAINS);
export const setHover = createActionCreator<number>(ActionType.SET_HOVER);
export const setOverrideHover = createActionCreator<number | 'none'>(ActionType.SET_OVERRIDE_HOVER);
export const setSelection = createActionCreator<Interval>(ActionType.SET_SELECTION);
export const setOverrideSelection = createActionCreator<Interval | 'none'>(ActionType.SET_OVERRIDE_SELECTION);

export const dataRequested = createActionCreator<SeriesId[]>(ActionType.DATA_REQUESTED);
export const dataReturned = createActionCreator<TBySeriesId<LoadedSeriesData>>(ActionType.DATA_RETURNED);
export const dataErrored = createActionCreator<TBySeriesId<any>>(ActionType.DATA_ERRORED);
