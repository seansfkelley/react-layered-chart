import { TBySeriesId } from '../interfaces';

export function objectWithKeys<T>(keys: string[], value: T): { [key: string]: T } {
  const object: { [key: string]: T } = {};
  keys.forEach(k => { object[k] = value });
  return object;
}

export function replaceValuesWithConstant<T>(anyBySeriesId: TBySeriesId<any>, value: T): TBySeriesId<T> {
  return _.mapValues(anyBySeriesId, _.constant(value));
}

export function objectWithKeysFromObject<T>(anyBySeriesId: TBySeriesId<any>, keys: string[], defaultValue: T): TBySeriesId<T> {
  const object: { [key: string]: T } = {};
  keys.forEach(k => { object[k] = anyBySeriesId[k] !== undefined ? anyBySeriesId[k] : defaultValue });
  return object;
}
