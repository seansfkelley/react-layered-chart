import * as React from 'react';
import { Interval } from '../core';
import { Chart, ChartProps } from './Chart';

export interface MultipleXDomainProps {
  xDomains?: Record<string, Interval>;
  onXDomainsChange?: (xDomains: Record<string, Interval>) => void;
  defaultXDomains?: Record<string, Interval>;
}

export interface SingleXDomainProps {
  xDomain?: Interval;
  onXDomainChange?: (xDomain: Interval) => void;
  defaultXDomain?: Interval;
}

export function WithSingleXDomain<T, P extends T & MultipleXDomainProps>(Component: React.ComponentClass<P>): React.ComponentClass<T & SingleXDomainProps> {
  return class extends React.PureComponent<T & SingleXDomainProps, void> {
    render() {
      return <Component/>;
    }
  }
}

// TODO: Figure out how to infer T not as {}.
const Foo = WithSingleXDomain(Chart);

// TODO: Other mixins of this type could include:
// - WithLoader
// - WithSingleYDomain
// - WithSelection (2D selection!)
// - WithHover (2D hover!)
