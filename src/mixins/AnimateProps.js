import _ from 'lodash';
import d3Interpolate from 'd3-interpolate';
import d3Ease from 'd3-ease';

import mixinToDecorator from './mixinToDecorator';

const ANIMATION_FRAMERATE = 30;

function animateOnce(fromValue, toValue, durationMs, onFrame) {
  const interpolator = d3Interpolate.interpolate(fromValue, toValue);
  const frameCount = Math.ceil(durationMs / 1000 * ANIMATION_FRAMERATE);

  let frame = 1;
  const setIntervalId = setInterval(() => {
    onFrame(interpolator(d3Ease.easeCubicInOut(frame / frameCount)));
    if (frame === frameCount) {
      clearInterval(setIntervalId);
    }
    frame++;
  }, durationMs / frameCount);

  return () => { clearInterval(setIntervalId); };
}

function _getStartValue(currentValue, startValue) {
  if (_.isArray(currentValue) && _.isArray(startValue)) {
    return currentValue.slice(0, startValue.length);
  } else {
    return currentValue || startValue;
  }
}

export const mixin = {
  componentWillMount: function() {
    if (!_.isPlainObject(this.animatedProps)) {
      throw new Error(this.constructor.name + ' must have an animatedProps field to use the AnimateProps decorator');
    }

    this.__animatingPropCancelCallbacks = {};
    _.each(this.animatedProps, (durationMs, propName) => {
      this.setState({
        [`animated-${propName}`]: this.props[propName]
      });
    });
  },

  componentWillReceiveProps: function(nextProps) {
    _.each(this.animatedProps, (durationMs, propName) => {
      if (this.props[propName] !== nextProps[propName]) {
        if (durationMs > 0) {
          if (this.__animatingPropCancelCallbacks[propName]) {
            this.__animatingPropCancelCallbacks[propName]();
          }
          const startValue = _getStartValue(this.state[`animated-${propName}`], this.props[propName]);
          this.__animatingPropCancelCallbacks[propName] = animateOnce(
            _.cloneDeep(startValue),
            _.cloneDeep(nextProps[propName]),
            durationMs,
            v => {
              this.setState({
                [`animated-${propName}`]: _.cloneDeep(v)
              });
            }
          );
        } else {
          this.setState({
            [`animated-${propName}`]: nextProps[propName]
          });
        }
      }
    });
  },

  componentWillUnmount: function() {
    _.each(this.__animatingPropCancelCallbacks, (fn) => fn());
  }
};

export const decorator = mixinToDecorator(mixin);
