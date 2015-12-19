import _ from 'lodash';

export default function CanvasRender(component){
  const oldComponentDidMount = component.prototype.componentDidMount;
  component.prototype.componentDidMount = function() {
    if (!_.isFunction(this.canvasRender)) {
      throw new Error(this.constructor.name + ' must implement a canvasRender function to use the CanvasRender decorator');
    }

    this.__boundCanvasRender = function() {
      this.__lastRafRequest = null;
      this.canvasRender();
    }.bind(this);

    this.__boundCanvasRender();

    if (oldComponentDidMount) {
      oldComponentDidMount.call(this);
    }
  };

  const oldComponentDidUpdate = component.prototype.componentDidUpdate;
  component.prototype.componentDidUpdate = function(prevProps, prevState) {
    if (!this.__lastRafRequest) {
      this.__lastRafRequest = requestAnimationFrame(this.__boundCanvasRender);
    }

    if (oldComponentDidUpdate) {
      oldComponentDidUpdate.call(this, prevProps, prevState);
    }
  };

  const oldComponentWillUnmount = component.prototype.componentWillUnmount;
  component.prototype.componentWillUnmount = function() {
    cancelAnimationFrame(this.__lastRafRequest);

    if (oldComponentWillUnmount) {
      oldComponentWillUnmount.call(this);
    }
  };
}
