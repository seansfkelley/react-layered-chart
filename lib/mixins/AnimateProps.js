import _ from 'lodash';
import d3 from 'd3';

const ANIMATION_FRAMERATE = 30;

function animateOnce(fromValue, toValue, durationMs, onFrame) {
  const interpolator = d3.interpolate(fromValue, toValue);
  const ease = d3.ease('cubic-in-out');
  const frameCount = Math.ceil(durationMs / 1000 * ANIMATION_FRAMERATE);

  let frame = 0;
  const setIntervalId = setInterval(() => {
    onFrame(interpolator(ease(frame / frameCount)));
    frame++;
    if (frame === frameCount) {
      clearInterval(setIntervalId);
    }
  }, durationMs / frameCount);

  return () => { clearInterval(setIntervalId); };
}

export default function AnimateProps(component) {
  const oldComponentWillMount = component.prototype.oldComponentWillMount;
  component.prototype.componentWillMount = function() {
    if (!_.isPlainObject(this.animatedProps)) {
      throw new Error(this.constructor.name + ' must have an animatedProps field to use the AnimateProps decorator');
    }

    this.__animatingPropCancelCallbacks = {};
    _.each(this.animatedProps, (durationMs, propName) => {
      this.setState({
        [`animated-${propName}`]: this.props[propName]
      });
    });

    if (oldComponentWillMount) {
      oldComponentWillMount.apply(this, _.toArray(arguments));
    }
  };

  const oldComponentWillReceiveProps = component.prototype.oldComponentWillReceiveProps;
  component.prototype.componentWillReceiveProps = function(nextProps) {
    _.each(this.animatedProps, (durationMs, propName) => {
      if (this.props[propName] !== nextProps[propName]) {
        if (durationMs > 0) {
          if (this.__animatingPropCancelCallbacks[propName]) {
            this.__animatingPropCancelCallbacks[propName]();
          }
          this.__animatingPropCancelCallbacks[propName] = animateOnce(this.props[propName], nextProps[propName], durationMs, v => {
            this.setState({
              [`animated-${propName}`]: _.clone(v)
            });
          });
        } else {
          this.setState({
            [`animated-${propName}`]: nextProps[propName]
          });
        }
      }
    });

    if (oldComponentWillReceiveProps) {
      oldComponentWillReceiveProps.apply(this, _.toArray(arguments));
    }
  };
}
