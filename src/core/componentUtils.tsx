import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
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

  @PureRender
  class AnimatedYDomainWrapper extends React.Component<Props, void> {
    render() {
      return (
        <Motion style={springifyInterval(this.props.yDomain)}>
          {interpolatedYDomain => <Component {...this.props} yDomain={interpolatedYDomain}/>}
        </Motion>
      );
    }
  }

  return AnimatedYDomainWrapper;
}
