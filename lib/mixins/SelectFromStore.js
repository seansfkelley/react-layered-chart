import _ from 'lodash';

import wrapAndDelegateAfter from './wrapAndDelegateAfter';

function _makeSelectFromObject(selectorObject) {
  return function(store) {
    return _.mapValues(selectorObject, selectorPath => _.get(store, selectorPath));
  };
}

export default function SelectFromStore(component){
  wrapAndDelegateAfter(component, 'componentWillMount', function() {
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
  });

  wrapAndDelegateAfter(component, 'componentWillUnmount', function() {
    this.__reduxUnsubscribe();
  });
}
