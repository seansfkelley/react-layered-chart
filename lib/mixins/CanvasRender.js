import _ from 'lodash';

import wrapAndDelegateAfter from './wrapAndDelegateAfter';

export default function CanvasRender(component){
  wrapAndDelegateAfter(component, 'componentDidMount', function() {
    if (!_.isFunction(this.canvasRender)) {
      throw new Error(this.constructor.name + ' must implement a canvasRender function to use the CanvasRender decorator');
    }

    this.__boundCanvasRender = function() {
      this.__lastRafRequest = null;
      this.canvasRender();
    }.bind(this);

    this.__lastRafRequest = requestAnimationFrame(this.__boundCanvasRender);
  });

  wrapAndDelegateAfter(component, 'componentDidUpdate', function() {
    if (!this.__lastRafRequest) {
      this.__lastRafRequest = requestAnimationFrame(this.__boundCanvasRender);
    }
  });

  wrapAndDelegateAfter(component, 'componentWillUnmount', function() {
    cancelAnimationFrame(this.__lastRafRequest);
  });
}
