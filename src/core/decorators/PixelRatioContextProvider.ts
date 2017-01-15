import * as _ from 'lodash';
import * as React from 'react';

export default function PixelRatioContextProvider(component: React.ComponentClass<any>) {
  component.childContextTypes = _.defaults({
    pixelRatio: React.PropTypes.number
  }, component.childContextTypes);

  const prototype = component.prototype as React.ComponentClass<any> & React.ChildContextProvider<any>;

  const oldGetChildContext = prototype.getChildContext;
  prototype.getChildContext = function() {
    const oldContext = oldGetChildContext ? oldGetChildContext.call(this) : {};
    return _.defaults({ pixelRatio: this.props.pixelRatio || this.context.pixelRatio }, oldContext);
  };
}
