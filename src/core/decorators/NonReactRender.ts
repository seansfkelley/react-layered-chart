import * as _ from 'lodash';
import * as React from 'react';

export default function NonReactRender(component: React.ComponentClass<any>) {
  const prototype = component.prototype as React.ComponentLifecycle<any, any>;

  const oldDidMount = prototype.componentDidMount;
  prototype.componentDidMount = function() {
    if (!_.isFunction(this.nonReactRender)) {
      throw new Error(this.constructor.name + ' must implement a nonReactRender function to use the NonReactRender decorator');
    }

    this.__boundNonReactRender = function() {
      this.__lastRafRequest = null;
      this.nonReactRender();
    }.bind(this);

    this.__lastRafRequest = requestAnimationFrame(this.__boundNonReactRender);

    if (oldDidMount) {
      oldDidMount.call(this);
    }
  }

  const oldDidUpdate = prototype.componentDidUpdate;
  prototype.componentDidUpdate = function() {
    if (!this.__lastRafRequest) {
      this.__lastRafRequest = requestAnimationFrame(this.__boundNonReactRender);
    }

    if (oldDidUpdate) {
      oldDidUpdate.call(this);
    }
  }

  const oldWillUnmount = prototype.componentWillUnmount;
  prototype.componentWillUnmount = function() {
    cancelAnimationFrame(this.__lastRafRequest);

    if (oldWillUnmount) {
      oldWillUnmount.call(this);
    }
  }
}
