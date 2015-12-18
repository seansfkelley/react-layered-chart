import _ from 'lodash';

function _makeSelectFromObject(selectorObject) {
  return function(store) {
    return _.mapValues(selectorObject, selectorPath => _.get(store, selectorPath));
  };
}

export default function SelectFromStore(component){
  const oldComponentWillMount = component.prototype.componentWillMount;
  component.prototype.componentWillMount = function() {
    let selectorFn;
    if (_.isPlainObject(this.selectFromStore)) {
      selectorFn = _makeSelectFromObject(this.selectFromStore);
    } else if (_.isPlainObject(this.constructor.selectFromStore)) {
      selectorFn = _makeSelectFromObject(this.constructor.selectFromStore);
    } else if (_.isFunction(this.selectFromStore)) {
      selectorFn = this.selectFromStore;
    } else if (_.isFunction(this.constructor.selectFromStore)) {
      selectorFn = this.constructor.selectFromStore;
    } else {
      throw new Error('Components must define a selectFromStore property or function to use the SelectFromStore decorator');
    }

    const boundSelectorFn = selectorFn.bind(this);

    this.__reduxUnsubscribe = this.props.store.subscribe(() =>
      this.setState(boundSelectorFn(this.props.store.getState()))
    );
    this.setState(boundSelectorFn(this.props.store.getState()));

    if (oldComponentWillMount) {
      oldComponentWillMount.call(this);
    }
  };


  const oldComponentWillUnmount = component.prototype.componentWillUnmount;
  component.prototype.componentWillUnmount = function() {
    this.__reduxUnsubscribe();

    if (oldComponentWillUnmount) {
      oldComponentWillUnmount.call(this);
    }
  };
}
