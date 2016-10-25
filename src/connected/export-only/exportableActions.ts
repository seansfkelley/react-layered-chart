import { Interval } from '../../core';
import { ActionType } from '../flux/atomicActions';

import {
  setYDomains as internalSetYDomains,
  setHover as internalSetHover,
  setSelection as internalSetSelection
} from '../flux/atomicActions';

import {
  setXDomainAndLoad as internalSetXDomain
} from '../flux/compoundActions';

function _castToAnyOutput<T>(actionCreator: (payload: T) => any): (payload: T) => any {
  return actionCreator;
}

export const setYDomains = _castToAnyOutput(internalSetYDomains);
export const setHover = _castToAnyOutput(internalSetHover);
export const setSelection = _castToAnyOutput(internalSetSelection);
export const setXDomain = _castToAnyOutput(internalSetXDomain);

export function getActionTypeName(actionValue: any): string {
  return ActionType[actionValue] || null;
}
