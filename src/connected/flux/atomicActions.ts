import { Interval, SeriesData } from '../../core/interfaces';
import { SeriesId, TBySeriesId, DataLoader } from '../interfaces';

export enum ActionType {
  DATA_REQUESTED = 1,
  DATA_RETURNED,
  DATA_ERRORED,
  SET_DATA_LOADER,
  SET_SERIES_IDS,
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

function createActionCreator<T>(type: ActionType) {
  return function(payload: T) {
    return { type, payload };
  };
}

export const setSeriesIds = createActionCreator<SeriesId[]>(ActionType.SET_SERIES_IDS);
export const setDataLoader = createActionCreator<DataLoader>(ActionType.SET_DATA_LOADER);
export const setChartPhysicalWidth = createActionCreator<number>(ActionType.SET_CHART_PHYSICAL_WIDTH);

export const setXDomain = createActionCreator<Interval>(ActionType.SET_X_DOMAIN);
export const setOverrideXDomain = createActionCreator<Interval>(ActionType.SET_OVERRIDE_X_DOMAIN);
export const setYDomains = createActionCreator<TBySeriesId<Interval>>(ActionType.SET_Y_DOMAINS);
export const setOverrideYDomains = createActionCreator<TBySeriesId<Interval>>(ActionType.SET_OVERRIDE_Y_DOMAINS);
export const setHover = createActionCreator<number>(ActionType.SET_HOVER);
export const setOverrideHover = createActionCreator<number>(ActionType.SET_OVERRIDE_HOVER);
export const setSelection = createActionCreator<Interval>(ActionType.SET_SELECTION);
export const setOverrideSelection = createActionCreator<Interval>(ActionType.SET_OVERRIDE_SELECTION);

export const dataRequested = createActionCreator<SeriesId[]>(ActionType.DATA_REQUESTED);
export const dataReturned = createActionCreator<TBySeriesId<SeriesData>>(ActionType.DATA_RETURNED);
export const dataErrored = createActionCreator<TBySeriesId<any>>(ActionType.DATA_ERRORED);
