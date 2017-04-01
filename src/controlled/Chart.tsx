import * as React from 'react';
import * as classNames from 'classnames';
import { Interval } from '../core';

interface State {
  xDomain: Interval;
  yDomains: Record<string, Interval>;
}

interface RenderableProps extends State {
  onXDomainChange: (xDomain: Interval) => void;
  onYDomainsChange: (yDomains: Record<string, Interval>) => void;
}

interface Props extends Partial<RenderableProps> {
  render: (props: RenderableProps) => React.ReactChild;
  defaultXDomain?: Interval;
  defaultYDomains?: Record<string, Interval>;
  className?: string;
}

export const DEFAULT_X_DOMAIN: Interval = {
  min: 0,
  max: 100
};

export const DEFAULT_Y_DOMAINS: Record<string, Interval> = {};

export class Chart extends React.PureComponent<Props, State> {
  state: State = {
    xDomain: this.props.xDomain || this.props.defaultXDomain || DEFAULT_X_DOMAIN,
    yDomains: this.props.yDomains || this.props.defaultYDomains || DEFAULT_Y_DOMAINS
  };

  componentWillReceiveProps(props: Props) {
    if (props.xDomain) {
      this.setState({ xDomain: props.xDomain });
    }
    if (props.yDomains) {
      this.setState({ yDomains: props.yDomains });
    }
  }

  private onXDomainChange = (xDomain: Interval) => {
    if (this.props.onXDomainChange) {
      this.props.onXDomainChange(xDomain);
    }
    if (!this.props.xDomain) {
      this.setState({ xDomain });
    }
  };

  private onYDomainsChange = (yDomains: Record<string, Interval>) => {
    if (this.props.onYDomainsChange) {
      this.props.onYDomainsChange(yDomains);
    }
    if (!this.props.yDomains) {
      this.setState({ yDomains });
    }
  };

  private stateChangeHandlers = {
    onXDomainChange: this.onXDomainChange,
    onYDomainsChange: this.onYDomainsChange
  };

  render() {
    return (
      <div className={classNames('lc-chart', this.props.className)}>
        <div className='resize-sentinel'/>
        {this.props.render({ ...this.state, ...this.stateChangeHandlers })}
      </div>
    );
  }
}


function controlledComponent<P, T, Value extends string>(Component: React.ComponentClass<P>, valueName: string) {
  interface Props {
    [valueName]: T;
  }

  interface State {
    value?: T;
  }

  return class extends React.PureComponent<Props, State> {
    render() {
      return <Component />;
    }
  }
}
