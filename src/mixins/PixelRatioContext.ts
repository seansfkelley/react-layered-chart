import * as _ from 'lodash';
import * as React from 'react';

export const mixin: React.Mixin<any, any> & React.ChildContextProvider<any> = {
  contextTypes: {
    pixelRatio: React.PropTypes.number
  },

  childContextTypes: {
    pixelRatio: React.PropTypes.number
  },

  getChildContext: function() {
    return { pixelRatio: this.props.pixelRatio || this.context.pixelRatio };
  }
};

export const decorator: ClassDecorator = (component: React.ComponentClass<any>) => {
  component.contextTypes = _.defaults({
    pixelRatio: React.PropTypes.number
  }, (<React.ComponentClass<any>> component.constructor).contextTypes);

  component.childContextTypes = _.defaults({
    pixelRatio: React.PropTypes.number
  }, (<React.ComponentClass<any>> component.constructor).childContextTypes);

  const oldGetChildContext = component.prototype.getChildContext;
  component.prototype.getChildContext = function() {
    const oldContext = oldGetChildContext ? oldGetChildContext.call(this) : {};
    return _.defaults({ pixelRatio: this.props.pixelRatio || this.context.pixelRatio }, oldContext);
  };
};
