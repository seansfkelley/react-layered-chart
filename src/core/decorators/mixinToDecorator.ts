import * as _ from 'lodash';
import * as React from 'react';

export default function<P, S>(mixin: React.Mixin<P, S>): ClassDecorator {
  return (component: React.ComponentClass<P>) => {
    _.each(mixin, (newFn, fnName) => {
      const oldFn = component.prototype[fnName];
      component.prototype[fnName] = function() {
        const argArray = _.toArray(arguments);
        const returnValue = newFn.apply(this, argArray);
        if (oldFn) {
          oldFn.apply(this, argArray);
        }
        return returnValue;
      };
    });
  };
}
