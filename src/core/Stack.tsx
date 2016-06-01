import * as _ from 'lodash';
import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as classnames from 'classnames';

import PixelRatioContext from './decorators/PixelRatioContext';
import PixelRatioContextProvider from './decorators/PixelRatioContextProvider';

export interface Props {
  className?: string;
  pixelRatio?: number;
}

@PureRender
@PixelRatioContext
@PixelRatioContextProvider
export default class Stack extends React.Component<Props, void> {
  static propTypes = {
    className: React.PropTypes.string,
    pixelRatio: React.PropTypes.number
  };

  render() {
    return (
      <div className={classnames('lc-stack', this.props.className)} ref='element'>
        {React.Children.map(this.props.children, (child, i) =>
          child
            // TODO: Casting is sketch. What actually happens if I get a non-component child, i.e., text?
            ? React.cloneElement(child as React.ReactElement<any>, {
              className: classnames('lc-layer', _.get<string>(child, 'props.className'))
            })
            : null
        )}
      </div>
    );
  }
}
