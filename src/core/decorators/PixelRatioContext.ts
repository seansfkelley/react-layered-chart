import * as _ from 'lodash';
import * as React from 'react';

export interface Context {
  pixelRatio: number;
}

const mixin: React.Mixin<any, any> = {
  contextTypes: {
    pixelRatio: React.PropTypes.number
  }
};

const decorator: ClassDecorator = (component: React.ComponentClass<any>) => {
  component.contextTypes = _.defaults({
    pixelRatio: React.PropTypes.number
  }, (<React.ComponentClass<any>> component.constructor).contextTypes);
};

export default decorator;
export { mixin as Mixin };
