import _ from 'lodash';

export default function(component, fnName, newFn) {
  const oldFn = component.prototype[fnName];
  component.prototype[fnName] = function() {
    const argArray = _.toArray(arguments);
    newFn.apply(this, argArray);
    if (oldFn) {
      oldFn.apply(this, argArray);
    }
  };
};
