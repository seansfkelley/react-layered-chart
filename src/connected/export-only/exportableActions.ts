import { Range } from '../../core';
import { ActionType } from '../model/ActionType';
import { TBySeriesId } from '../interfaces';
import {
  setXDomain as internalSetXDomain,
  setYDomain as internalSetYDomain,
  setHover as internalSetHover,
  setSelection as internalSetSelection
} from '../flux/uiActions';

export function setXDomain(payload: Range) {
  return internalSetXDomain(payload);
}

export function setYDomains(payload: TBySeriesId<Range>) {
  return internalSetYDomain(payload);
}

export function setHover(payload: number) {
  return internalSetHover(payload);
}

export function setSelection(payload: Range) {
  return internalSetSelection(payload);
}
