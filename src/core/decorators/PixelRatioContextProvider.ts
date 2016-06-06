import * as _ from 'lodash';
import * as React from 'react';

const mixin: React.Mixin<any, any> & React.ChildContextProvider<any> = {
  childContextTypes: {
    pixelRatio: React.PropTypes.number
  },

  getChildContext: function() {
    return { pixelRatio: this.props.pixelRatio || this.context.pixelRatio };
  }
};

const decorator: ClassDecorator = (component: React.ComponentClass<any>) => {
  component.childContextTypes = _.defaults({
    pixelRatio: React.PropTypes.number
  }, (<React.ComponentClass<any>> component.constructor).childContextTypes);

  const oldGetChildContext = component.prototype.getChildContext;
  component.prototype.getChildContext = function() {
    const oldContext = oldGetChildContext ? oldGetChildContext.call(this) : {};
    return _.defaults({ pixelRatio: this.props.pixelRatio || this.context.pixelRatio }, oldContext);
  };
};

export default decorator;
export { mixin as Mixin };
