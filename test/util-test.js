import { spy } from 'sinon';

import { shallowMemoize } from '../src/ext/util';

describe('util', () => {
  describe('#shallowMemoize', () => {
    let spiedFn;
    let memoizedFn;

    beforeEach(() => {
      spiedFn = spy();
      memoizedFn = shallowMemoize(spiedFn);
    });

    it('should run the function on the first call', () => {
      memoizedFn();
      spiedFn.calledOnce.should.be.true();
    });

    it('should run the wrapped function with the `this` context of the wrapper function', () => {
      const thisObj = {};
      memoizedFn.call(thisObj);
      spiedFn.getCall(0).thisValue.should.equal(thisObj);
    });

    it('should forward all the arguments', () => {
      const arg1 = {};
      const arg2 = {};
      memoizedFn(arg1, arg2);
      spiedFn.getCall(0).args[0].should.equal(arg1);
      spiedFn.getCall(0).args[1].should.equal(arg2);
    });

    it('should only run the function once when called with reference-equal arguments', () => {
      const arg1 = {};
      memoizedFn(arg1);
      memoizedFn(arg1);
      spiedFn.callCount.should.equal(1);
    });

    it('should run the function again with value-equals but reference-different values', () => {
      const arg1 = {};
      const arg2 = {};
      memoizedFn(arg1);
      memoizedFn(arg2);
      spiedFn.callCount.should.equal(2);
    });

    it ('should run the function multiple times if identical calls are not consecutive', () => {
      const arg1 = {};
      const arg2 = {};
      memoizedFn(arg1);
      memoizedFn(arg2);
      memoizedFn(arg1);
      spiedFn.callCount.should.equal(3);
    });
  });
});
