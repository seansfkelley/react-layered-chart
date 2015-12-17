export default function CanvasRender(component){
  if (!component.prototype.canvasRender) {
    throw new Error('Components must implement a canvasRender method to use the CanvasRender decorator');
  }

  const oldComponentDidMount = component.prototype.componentDidMount;
  component.prototype.componentDidMount = function() {
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
