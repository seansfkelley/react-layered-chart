import {
  objectWithKeys,
  replaceValuesWithConstant,
  objectWithKeysFromObject
} from '../src/connected/flux/reducerUtils';

describe('(reducer utils)', () => {
  describe('objectWithKeys', () => {
    it('should yield an object with the specified keys', () => {
      objectWithKeys(['a', 'b'], true).should.deepEqual({
        a: true,
        b: true
      });
    });

    // _.each early-aborts when you return false, which caused an issue earlier.
    it('should work as expected even when the value is false', () => {
      objectWithKeys(['a', 'b'], false).should.deepEqual({
        a: false,
        b: false
      });
    });

    it('should not clone the default value for each key', () => {
      const { a, b } = objectWithKeys(['a', 'b'], {});
      a.should.be.exactly(b);
    });
  });

  describe('replaceValuesWithConstant', () => {
    it('should replace all the values in the given object with the given value', () => {
      replaceValuesWithConstant({ a: 1, b: 2 }, true).should.deepEqual({
        a: true,
        b: true
      });
    });

    // _.each early-aborts when you return false, which caused an issue earlier.
    it('should work as expected even when the value is false', () => {
      replaceValuesWithConstant({ a: 1, b: 2 }, false).should.deepEqual({
        a: false,
        b: false
      });
    });

    it('should not mutate the input value', () => {
      const input = { a: 1 };
      const output = replaceValuesWithConstant(input, true);
      input.should.not.be.exactly(output);
      input.should.deepEqual({ a: 1 });
    });

    it('should not clone the default value for each key', () => {
      const { a, b } = replaceValuesWithConstant({ a: 1, b: 2 }, {});
      a.should.be.exactly(b);
    });
  });

  describe('objectWithKeysFromObject', () => {
    it('should add any missing keys using the default value', () => {
      objectWithKeysFromObject({}, ['a'], true).should.deepEqual({
        a: true
      });
    });

    it('should remove any extraneous keys', () => {
      objectWithKeysFromObject({ a: 1 }, [], true).should.deepEqual({});
    });

    it('should add and remove keys as necessary, preferring the value of existing keys', () => {
      objectWithKeysFromObject({ a: 1, b: 2 }, ['b', 'c'], true).should.deepEqual({
        b: 2,
        c: true
      });
    });

    // _.each early-aborts when you return false, which caused an issue earlier.
    it('should work as expected even when the value is false', () => {
      objectWithKeysFromObject({ a: false }, ['a'], true).should.deepEqual({
        a: false
      });

      objectWithKeysFromObject({ a: true }, ['a'], false).should.deepEqual({
        a: true
      });

      objectWithKeysFromObject({}, ['a'], false).should.deepEqual({
        a: false
      });
    });

    it('should not mutate the input value', () => {
      const input = { a: 1 };
      const output = objectWithKeysFromObject(input, ['a'], true);
      input.should.not.be.exactly(output);
      input.should.deepEqual({ a: 1 });
    });

    it('should not clone the default value for each key', () => {
      const { a, b } = objectWithKeysFromObject({}, ['a', 'b'], {});
      a.should.be.exactly(b);
    });
  });
});
