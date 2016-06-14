import { Interval } from '../../core';
import { Action, ActionType } from '../model/ActionType';
import { TBySeriesId } from '../interfaces';
import { requestDataLoad } from './dataActions';

export function setXDomain(payload: Interval, isOverride: boolean = false) {
  return (dispatch, getState) => {
    dispatch({
      type: isOverride ? ActionType.SET_OVERRIDE_X_DOMAIN : ActionType.SET_X_DOMAIN,
      payload
    });

    if (isOverride || (!isOverride && !getState().uiStateConsumerOverrides.xDomain)) {
      dispatch(requestDataLoad());
    }
  };
}

export function setYDomain(payload: TBySeriesId<Interval>, isOverride: boolean = false) {
  return {
    type: isOverride ? ActionType.SET_OVERRIDE_Y_DOMAINS : ActionType.SET_Y_DOMAINS,
    payload
  };
}

export function setPhysicalChartWidth(payload: number) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionType.SET_CHART_PHYSICAL_WIDTH,
      payload
    });
    dispatch(requestDataLoad());
  };
}

export function setHover(payload: number, isOverride: boolean = false) {
  return {
    type: isOverride ? ActionType.SET_OVERRIDE_HOVER : ActionType.SET_HOVER,
    payload
  };
}

export function setSelection(payload: Interval, isOverride: boolean = false) {
  return {
    type: isOverride ? ActionType.SET_OVERRIDE_SELECTION : ActionType.SET_SELECTION,
    payload
  };
}
