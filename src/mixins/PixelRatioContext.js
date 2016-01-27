import React from 'react';
import _ from 'lodash';

import mixinToDecorator from './mixinToDecorator';

export const mixin = {
  contextTypes: {
    pixelRatio: React.PropTypes.number
  },

  childContextTypes: {
    pixelRatio: React.PropTypes.number
  },

  getChildContext: function() {
    return this.context.pixelRatio || this.props.pixelRatio || 1;
  }
};

export const decorator = (component) => {
  component.contextTypes = _.defaults({
    pixelRatio: React.PropTypes.number
  }, component.constructor.contextTypes);

  component.childContextTypes = _.defaults({
    pixelRatio: React.PropTypes.number
  }, component.constructor.childContextTypes);

  const oldGetChildContext = component.prototype.getChildContext;
  component.prototype.getChildContext = function() {
    const oldContext = oldGetChildContext ? oldGetChildContext.call(this) : {};
    return _.defaults({ pixelRatio: this.props.pixelRatio || this.context.pixelRatio }, oldContext);
  };
};
