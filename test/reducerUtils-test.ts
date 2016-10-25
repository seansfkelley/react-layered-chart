import { expect } from 'chai';

import {
  objectWithKeys,
  replaceValuesWithConstant,
  objectWithKeysFromObject
} from '../src/connected/flux/reducerUtils';

describe('(reducer utils)', () => {
  describe('objectWithKeys', () => {
    it('should yield an object with the specified keys', () => {
      expect(objectWithKeys(['a', 'b'], true)).to.deep.equal({
        a: true,
        b: true
      });
    });

    // _.each early-aborts when you return false, which caused an issue earlier.
    it('should work as expected even when the value is false', () => {
      expect(objectWithKeys(['a', 'b'], false)).to.deep.equal({
        a: false,
        b: false
      });
    });

    it('should not clone the default value for each key', () => {
      const { a, b } = objectWithKeys(['a', 'b'], {});
      expect(a).to.equal(b);
    });
  });

  describe('replaceValuesWithConstant', () => {
    it('should replace all the values in the given object with the given value', () => {
      expect(replaceValuesWithConstant({ a: 1, b: 2 }, true)).to.deep.equal({
        a: true,
        b: true
      });
    });

    // _.each early-aborts when you return false, which caused an issue earlier.
    it('should work as expected even when the value is false', () => {
      expect(replaceValuesWithConstant({ a: 1, b: 2 }, false)).to.deep.equal({
        a: false,
        b: false
      });
    });

    it('should not mutate the input value', () => {
      const input = { a: 1 };
      const output = replaceValuesWithConstant(input, true);
      expect(input).to.not.equal(output);
      expect(input).to.deep.equal({ a: 1 });
    });

    it('should not clone the default value for each key', () => {
      const { a, b } = replaceValuesWithConstant({ a: 1, b: 2 }, {});
      expect(a).to.equal(b);
    });
  });

  describe('objectWithKeysFromObject', () => {
    it('should add any missing keys using the default value', () => {
      expect(objectWithKeysFromObject({}, ['a'], true)).to.deep.equal({
        a: true
      });
    });

    it('should remove any extraneous keys', () => {
      expect(objectWithKeysFromObject({ a: 1 }, [], true)).to.deep.equal({});
    });

    it('should add and remove keys as necessary, preferring the value of existing keys', () => {
      expect(objectWithKeysFromObject({ a: 1, b: 2 }, ['b', 'c'], true)).to.deep.equal({
        b: 2,
        c: true
      });
    });

    // _.each early-aborts when you return false, which caused an issue earlier.
    it('should work as expected even when the value is false', () => {
      expect(objectWithKeysFromObject({ a: false }, ['a'], true)).to.deep.equal({
        a: false
      });

      expect(objectWithKeysFromObject({ a: true }, ['a'], false)).to.deep.equal({
        a: true
      });

      expect(objectWithKeysFromObject({}, ['a'], false)).to.deep.equal({
        a: false
      });
    });

    it('should not mutate the input value', () => {
      const input = { a: 1 };
      const output = objectWithKeysFromObject(input, ['a'], true);
      expect(input).to.not.equal(output);
      expect(input).to.deep.equal({ a: 1 });
    });

    it('should not clone the default value for each key', () => {
      const { a, b } = objectWithKeysFromObject({}, ['a', 'b'], {});
      expect(a).to.equal(b);
    });
  });
});
