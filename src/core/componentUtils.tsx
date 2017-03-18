import * as React from 'react';
import { Motion, spring } from 'react-motion';

import { Interval } from './interfaces';

function springifyInterval(interval: Interval) {
  return {
    min: spring(interval.min),
    max: spring(interval.max)
  };
}

export interface YDomainProp {
  yDomain: Interval;
}

export function wrapWithAnimatedYDomain<Props extends YDomainProp>(Component: React.ComponentClass<Props>): React.ComponentClass<Props> {

  class AnimatedYDomainWrapper extends React.PureComponent<Props, void> {
    render() {
      return (
        <Motion style={springifyInterval(this.props.yDomain)}>
          {(interpolatedYDomain: Interval) => <Component {...this.props} yDomain={interpolatedYDomain}/>}
        </Motion>
      );
    }
  }

  return AnimatedYDomainWrapper;
}
