import React from 'react';

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

export const decorator = mixinToDecorator(mixin);
