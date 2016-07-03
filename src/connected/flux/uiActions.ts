import { Interval } from '../../core';
import { Action, ActionType } from '../model/ActionType';
import { TBySeriesId } from '../interfaces';
import { requestDataLoad } from './dataActions';

import {
  setXDomain,
  setOverrideXDomain,
  setYDomains,
  setOverrideYDomains,
  setHover,
  setOverrideHover,
  setSelection,
  setOverrideSelection,
  setPhysicalChartWidth
} from './atomicActions';

// TODO: Rename to setXDomainWithOverride or something that differentiates it.
export function setXDomain(payload: Interval, isOverride: boolean = false) {
  if (isOverride) {
    return (dispatch, getState) => {
      dispatch(setOverrideXDomain(payload));
      dispatch(requestDataLoad());
    };
  } else {
    return (dispatch, getState) => {
      dispatch(setXDomain(payload));
      if (!getState().uiStateConsumerOverrides.xDomain) {
        dispatch(requestDataLoad());
      }
    };
  }
}

export function setYDomain(payload: TBySeriesId<Interval>, isOverride: boolean = false) {
  if (isOverride) {
    return setYDomains(payload);
  } else {
    return setOverrideYDomains(payload);
  }
}

export function setHover(payload: number, isOverride: boolean = false) {
  if (isOverride) {
    return setHover(payload);
  } else {
    return setOverrideHover(payload);
  }
}

export function setSelection(payload: Interval, isOverride: boolean = false) {
  if (isOverride) {
    return setSelection(payload);
  } else {
    return setOverrideSelection(payload);
  }
}

export function setPhysicalChartWidth(payload: number) {
  return (dispatch, getState) => {
    dispatch(setChartPhysicalWidth(payload));
    dispatch(requestDataLoad());
  };
}
