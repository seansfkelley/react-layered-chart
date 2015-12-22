import _ from 'lodash';
import { animateOnce } from '../util';

// TODO: There's a bug here where AutoresizingCanvasLayer calls canvasRender synchronously before the
// async setState from componentWillMount has gone through, so canvasRender ends up with undefined
// state. We can't override the constructor, cause that's afaict just not possible. We could override
// canvasRender on the fly to necessarily be wrapped ina a RAF, but I don't really like that monkeypatching
// and in any case, if it fixed it, it would be luckliy through alternate race conditions instead of by
// actually solving the problem.
export default function AnimateProps(component) {
  const oldComponentWillMount = component.prototype.oldComponentWillMount;
  component.prototype.componentWillMount = function() {
    if (!_.isPlainObject(this.animatedProps)) {
      throw new Error(this.constructor.name + ' must have an animatedProps field to use the AnimateProps decorator');
    }

    this.__animatingProps = {};
    _.each(this.animatedProps, (durationMs, propName) => {
      this.setState({
        [`animated-{propName}`]: this.props[propName]
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
          if (this.__animatingProps[propName]) {
            this.__animatingProps[propName]();
          }
          this.__animatingProps[propName] = animateOnce(this.props[propName], nextProps[propName], durationMs, v => {
            this.setState({
              [`animated-{propName}`]: _.clone(v)
            });
          });
        } else {
          this.setState({
            [`animated-{propName}`]: nextProps[propName]
          });
        }
      }
    });

    if (oldComponentWillReceiveProps) {
      oldComponentWillReceiveProps.apply(this, _.toArray(arguments));
    }
  };
}
