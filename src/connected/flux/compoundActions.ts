import { Interval } from '../../core';
import { requestDataLoad } from './dataActions';

import {
  setXDomain,
  setOverrideXDomain,
  setPhysicalChartWidth
} from './atomicActions';

export function setXDomainAndMaybeLoad(payload: Interval, isOverride: boolean = false) {
  return (dispatch, getState) => {
    dispatch(setXDomain(payload));
    if (!getState().uiStateConsumerOverrides.xDomain) {
      dispatch(requestDataLoad());
    }
  };
}

export function setOverrideXDomainAndLoad(payload: Interval) {
  return (dispatch, getState) => {
    dispatch(setOverrideXDomain(payload));
    dispatch(requestDataLoad());
  };
}

export function setPhysicalChartWidthAndLoad(payload: number) {
  return (dispatch, getState) => {
    dispatch(setChartPhysicalWidth(payload));
    dispatch(requestDataLoad());
  };
}
