import _ from 'lodash';
import { animateOnce } from '../util';

export default function AnimateProps(component) {
  const oldComponentWillMount = component.prototype.oldComponentWillMount;
  component.prototype.componentWillMount = function() {
    if (!_.isPlainObject(this.animatedProps)) {
      throw new Error(this.constructor.name + ' must have an animatedProps field to use the AnimateProps decorator');
    }

    this.__animatingProps = {};
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
          if (this.__animatingProps[propName]) {
            this.__animatingProps[propName]();
          }
          this.__animatingProps[propName] = animateOnce(this.props[propName], nextProps[propName], durationMs, v => {
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
