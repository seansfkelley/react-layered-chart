import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { Motion, spring } from 'react-motion';

import { Range } from './interfaces';

export function springifyRange(range: Range) {
  return {
    min: spring(range.min),
    max: spring(range.max)
  };
}

export interface YDomainProp {
  yDomain: Range;
}

export function wrapWithAnimatedYDomain<Props extends YDomainProp>(Component: React.ComponentClass<Props>): React.ComponentClass<Props> {

  @PureRender
  class AnimatedYDomainWrapper extends React.Component<Props, void> {
    render() {
      return (
        <Motion style={springifyRange(this.props.yDomain)}>
          {interpolatedYDomain => <Component {...this.props} yDomain={interpolatedYDomain}/>}
        </Motion>
      );
    }
  }

  return AnimatedYDomainWrapper;
}
