import * as React from 'react';
import * as classNames from 'classnames';
import { Interval } from '../core';

export interface ChartState {
  xDomain: Interval;
  yDomains: Record<string, Interval>;
  data: Record<string, any[]>;
}

export interface OnChangeHandlers {
  onXDomainChange: (xDomain: Interval) => void;
  onYDomainsChange: (yDomains: Record<string, Interval>) => void;
  onDataChange: (data: Record<string, any[]>) => void;
}

export interface RenderableProps extends ChartState, OnChangeHandlers {}

export interface ChartProps extends Partial<RenderableProps> {
  render: (props: RenderableProps) => React.ReactChild;
  defaultXDomain?: Interval;
  defaultYDomains?: Record<string, Interval>;
  defaultData?: Record<string, any[]>;
  className?: string;
}

export const DEFAULT_X_DOMAIN: Interval = {
  min: 0,
  max: 100
};

export const DEFAULT_Y_DOMAINS: Record<string, Interval> = {};

export const DEFAULT_DATA: Record<string, any[]> = {};

export class Chart extends React.PureComponent<ChartProps, ChartState> {
  state: ChartState = {
    xDomain: this.props.xDomain || this.props.defaultXDomain || DEFAULT_X_DOMAIN,
    yDomains: this.props.yDomains || this.props.defaultYDomains || DEFAULT_Y_DOMAINS,
    data: this.props.data || this.props.defaultData || DEFAULT_DATA
  };

  private setStateFromProp(props: ChartState, valueName: keyof ChartState) {
    if (props[valueName]) {
      this.setState({ [valueName]: props[valueName] } as any);
    }
  }

  componentWillReceiveProps(props: ChartState) {
    this.setStateFromProp(props, 'xDomain');
    this.setStateFromProp(props, 'yDomains');
    this.setStateFromProp(props, 'data');
  }

  private makeOnChangeHandler<S extends keyof ChartState, H extends keyof OnChangeHandlers>(valueName: S, handlerName: H) {
    return (value: ChartState[S]) => {
      if (this.props[handlerName]) {
        (this.props[handlerName] as any)(value);
      }
      if (this.props[valueName] == null) {
        this.setState({ [valueName as any]: value });
      }
    }
  }

  private onXDomainChange = this.makeOnChangeHandler('xDomain', 'onXDomainChange');
  private onYDomainsChange = this.makeOnChangeHandler('yDomains', 'onYDomainsChange');
  private onDataChange = this.makeOnChangeHandler('data', 'onDataChange');

  private stateChangeHandlers = {
    onXDomainChange: this.onXDomainChange,
    onYDomainsChange: this.onYDomainsChange,
    onDataChange: this.onDataChange
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
