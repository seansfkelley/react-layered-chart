import * as React from 'react';
import * as classNames from 'classnames';

import PixelRatioContext from './decorators/PixelRatioContext';
import PixelRatioContextProvider from './decorators/PixelRatioContextProvider';

export interface Props {
  className?: string;
  pixelRatio?: number;
}

@PixelRatioContext
@PixelRatioContextProvider
export default class Stack extends React.PureComponent<Props, void> {
  static propTypes = {
    className: React.PropTypes.string,
    pixelRatio: React.PropTypes.number
  };

  render() {
    return (
      <div className={classNames('lc-stack', this.props.className)} ref='element'>
        {this.props.children}
      </div>
    );
  }
}
