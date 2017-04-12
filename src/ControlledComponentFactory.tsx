import * as _ from 'lodash';
import * as React from 'react';

function isUpper(s: string) {
  return s === s.toUpperCase();
}

function firstLower(s: string) {
  return s[0].toLowerCase() + s.slice(1);
}

function maybeFormatDefaultKey(s: string) {
  if (s.length > 7 && s.slice(0, 7) === 'default' && isUpper(s[7])) {
    return firstLower(s.slice(7));
  } else {
    return undefined;
  }
}

function maybeFormatOnChangeKey(s: string) {
  if (s.length > 8 && s.slice(0, 2) === 'on' && isUpper(s[2]) && s.slice(s.length - 6) === 'Change') {
    return firstLower(s.slice(2, s.length - 6));
  } else {
    return undefined;
  }
}

function maybeFormatValueKey(s: string) {
  if (s.length > 0 && isUpper(s[0])) {
    return s;
  } else {
    return undefined;
  }
}

export function createControlledComponent<T>(propTypes: React.ValidationMap<T>, defaultValues: { [K in keyof T]: any }) {//: React.ComponentClass<T> {
  return _.chain(propTypes)
    .toPairs()
    .groupBy((pair: [ string, React.Validator<T> ]) => {
      const key = pair[0];
      const normalizedKey = maybeFormatDefaultKey(key) || maybeFormatOnChangeKey(key) || maybeFormatValueKey(key);
      if (normalizedKey) {
        return normalizedKey;
      } else {
        throw new Error(`proptype ${key} doesn't adhere to an inferrable format (defaultFooBar, onFooBarChange, fooBar)`);
      }
    })
    .map((pairs: [ string, React.Validator<T> ][], valueName: string) => {
      if (pairs.length !== 3) {
        throw new Error(`inferred value name ${valueName} needs exactly 3 prop types (defaultFooBar, onFooBarChange, fooBar), but received ${pairs.length}: (${pairs.join(', ')})`);
      }
      let valueKey, defaultValueKey, onValueChangeKey;
      pairs.forEach(([ key, _validator ]) => {
        if (maybeFormatDefaultKey(key)) {
          defaultValueKey = key;
        } else if (maybeFormatOnChangeKey(key)) {
          onValueChangeKey = key;
        } else if (maybeFormatValueKey(key)) {
          valueKey = key;
        }
      });
    })
    .value();
}
