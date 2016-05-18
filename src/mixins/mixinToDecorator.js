import _ from 'lodash';

export default function(mixin) {
  return (component) => {
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
