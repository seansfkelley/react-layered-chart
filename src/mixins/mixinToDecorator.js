import _ from 'lodash';

export default function(mixin) {
  return (component) => {
    _.each(mixin, (newValue, fieldName) => {

      if (_.isFunction(newValue)) {
        const oldFn = component.prototype[fieldName];
        if (oldFn && !_.isFunction(oldFn)) {
          throw new Error(`cannot decorate non-function field ${fieldName} with a function`);
        }
        component.prototype[fieldName] = function() {
          const argArray = _.toArray(arguments);
          newValue.apply(this, argArray);
          if (oldFn) {
            oldFn.apply(this, argArray);
          }
        };
      } else if (_.isObject(newValue)) {
        let oldValue = component.constructor[fieldName];
        if (oldValue && !_.isPlainObject(oldValue)) {
          throw new Error(`cannot decorate non-object field ${fieldName} with an object`);
        }
        component.constructor[fieldName] = _.defaults({}, newValue, oldValue);

        oldValue = component.prototype[fieldName];
        if (oldValue && !_.isPlainObject(oldValue)) {
          throw new Error(`cannot decorate non-object field ${fieldName} with an object`);
        }
        component.prototype[fieldName] = _.defaults({}, newValue, oldValue);
      } else {
        throw new Error(`cannot convert a mixin to decorator for non-function, non-object field ${fieldName}`);
      }

    });
  };
}
