import * as _ from 'lodash';
import * as React from 'react';

import mixinToDecorator from './mixinToDecorator';

const mixin: React.Mixin<any, any> = {
  componentDidMount: function (){
    if (!_.isFunction(this.nonReactRender)) {
      throw new Error(this.constructor.name + ' must implement a nonReactRender function to use the NonReactRender decorator');
    }

    this.__boundNonReactRender = function() {
      this.__lastRafRequest = null;
      this.nonReactRender();
    }.bind(this);

    this.__lastRafRequest = requestAnimationFrame(this.__boundNonReactRender);
  },

  componentDidUpdate: function() {
    if (!this.__lastRafRequest) {
      this.__lastRafRequest = requestAnimationFrame(this.__boundNonReactRender);
    }
  },

  componentWillUnmount: function() {
    cancelAnimationFrame(this.__lastRafRequest);
  }
};

const decorator = mixinToDecorator(mixin);

export default decorator;
export { mixin as Mixin };
