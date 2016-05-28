import * as _ from 'lodash';
import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as actions from '../flux/uiActions';

type BoundActions = typeof actions;

interface Props {
  actions: BoundActions;
}

@PureRender
class ConnectedResizeSentinelLayer extends React.Component<Props, {}> {
  private __setSizeInterval: number;
  private __lastWidth: number;

  render() {
    return (
      <div className='lc-layer resize-sentinel' ref='element'/>
    );
  }

  componentDidMount() {
    this._maybeCallOnSizeChange();
    this.__setSizeInterval = setInterval(this._maybeCallOnSizeChange, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.__setSizeInterval);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.actions !== nextProps.actions && _.isNumber(this.__lastWidth)) {
      this.props.actions.setPhysicalChartWidth(this.__lastWidth);
    }
  }

  private _maybeCallOnSizeChange = () => {
    const newWidth = (this.refs['element'] as HTMLElement).offsetWidth;
    if (this.__lastWidth !== newWidth) {
      this.__lastWidth = newWidth;
      this.props.actions.setPhysicalChartWidth(this.__lastWidth);
    }
  };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: BoundActions } {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(ConnectedResizeSentinelLayer) as any as React.ComponentClass<void>;
