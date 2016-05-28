// This is not actually an unused import: tsc needs this name in scope to compile a definition for some reason.
import { ActionType } from '../model/ActionType';
import { Range } from 'react-layered-chart';

import { TBySeriesId } from '../model/typedefs';
import {
  setXDomain as internalSetXDomain,
  setYDomain as internalSetYDomain,
  setHover as internalSetHover,
  setSelection as internalSetSelection
} from '../flux/uiActions';

export function setXDomain(payload: Range) {
  return internalSetXDomain(payload);
}

export function setYDomain(payload: TBySeriesId<Range>) {
  return internalSetYDomain(payload);
}

export function setHover(payload: number) {
  return internalSetHover(payload);
}

export function setSelection(payload: Range) {
  return internalSetSelection(payload);
}
