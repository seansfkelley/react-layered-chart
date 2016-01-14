import _ from 'lodash';

import mixinToDecorator from '../../../src/mixins/mixinToDecorator';

function _makeSelectFromObject(selectorObject) {
  return function(store) {
    return _.mapValues(selectorObject, selectorPath => _.get(store, selectorPath));
  };
}

export const mixin = {
  componentWillMount: function() {
    let selectorFn;
    if (_.isPlainObject(this.constructor.selectFromStore)) {
      selectorFn = _makeSelectFromObject(this.constructor.selectFromStore);
    } else if (_.isFunction(this.constructor.selectFromStore)) {
      selectorFn = this.constructor.selectFromStore;
    } else {
      throw new Error(this.constructor.name + ' must define a static selectFromStore property or function to use the SelectFromStore decorator');
    }

    const boundSelectorFn = selectorFn.bind(this);

    this.__reduxUnsubscribe = this.props.store.subscribe(() =>
      this.setState(boundSelectorFn(this.props.store.getState()))
    );
    this.setState(boundSelectorFn(this.props.store.getState()));
  },

  componentWillUnmount: function() {
    this.__reduxUnsubscribe();
  }
};

export const decorator = mixinToDecorator(mixin);
