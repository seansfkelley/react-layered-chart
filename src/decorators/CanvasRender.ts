import * as _ from 'lodash';
import * as React from 'react';

import mixinToDecorator from './mixinToDecorator';

const mixin: React.Mixin<any, any> = {
  componentDidMount: function (){
    if (!_.isFunction(this.canvasRender)) {
      throw new Error(this.constructor.name + ' must implement a canvasRender function to use the CanvasRender decorator');
    }

    this.__boundCanvasRender = function() {
      this.__lastRafRequest = null;
      this.canvasRender();
    }.bind(this);

    this.__lastRafRequest = requestAnimationFrame(this.__boundCanvasRender);
  },

  componentDidUpdate: function() {
    if (!this.__lastRafRequest) {
      this.__lastRafRequest = requestAnimationFrame(this.__boundCanvasRender);
    }
  },

  componentWillUnmount: function() {
    cancelAnimationFrame(this.__lastRafRequest);
  }
};

const decorator = mixinToDecorator(mixin);

export default decorator;
export { mixin as Mixin };
