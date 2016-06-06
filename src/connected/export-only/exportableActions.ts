import { Interval } from '../../core';
import { ActionType } from '../model/ActionType';
import { TBySeriesId } from '../interfaces';
import {
  setXDomain as internalSetXDomain,
  setYDomain as internalSetYDomain,
  setHover as internalSetHover,
  setSelection as internalSetSelection
} from '../flux/uiActions';

export function setXDomain(payload: Interval) {
  return internalSetXDomain(payload);
}

export function setYDomains(payload: TBySeriesId<Interval>) {
  return internalSetYDomain(payload);
}

export function setHover(payload: number) {
  return internalSetHover(payload);
}

export function setSelection(payload: Interval) {
  return internalSetSelection(payload);
}
