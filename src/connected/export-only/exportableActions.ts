import { ActionType } from '../flux/atomicActions';

export {
  setYDomains,
  setHover,
  setSelection
} from '../flux/atomicActions';

export {
  setXDomainAndLoad as setXDomain
} from '../flux/compoundActions';

export function getActionTypeName(actionValue: any): string {
  return ActionType[actionValue] || null;
}