import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';

import SelectFromStore from './mixins/SelectFromStore';
import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';
import BrushLayer from './layers/BrushLayer';
import InteractionCaptureLayer from './layers/InteractionCaptureLayer';
import HoverLayer from './layers/HoverLayer';
import Stack from './Stack';

import ActionType from './flux/ActionType';
import InteractionActions from './flux/InteractionActions';

import YAxis from './axes/YAxis';
import XAxis from './axes/XAxis';

import { shallowMemoize, mergeRangesOfSameType } from './util';

function getMergedYDomains(shouldMerge, seriesIds, yAxisBySeriesId, metadataBySeriesId) {
  const rangeGroups = shouldMerge
    ? mergeRangesOfSameType(seriesIds, yAxisBySeriesId, metadataBySeriesId)
    : seriesIds.map(seriesId => ({
        range: yAxisBySeriesId[seriesId],
        color: _.get(metadataBySeriesId, [ seriesId, 'color' ]),
        seriesIds: [ seriesId ]
      }));

  let yDomainBySeriesId = {};
  _.each(rangeGroups, ({ seriesIds, range }) =>
    _.each(seriesIds, seriesId => yDomainBySeriesId[seriesId] = range)
  );

  return {
    yDomainBySeriesId,
    orderedYDomains: _.pluck(rangeGroups, 'range'),
    orderedColors: _.pluck(rangeGroups, 'color')
  }
}

@PureRender
@SelectFromStore
class DefaultChart extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired,
    mergeAxesOfSameType: React.PropTypes.bool
  };

  static defaultProps = {
    mergeAxesOfSameType: true
  };

  static selectFromStore = {
    selection: 'selection',
    hover: 'hover',
    xAxis: 'xAxis',
    seriesIds: 'seriesIds',
    yAxisBySeriesId: 'yAxisBySeriesId',
    metadataBySeriesId: 'metadataBySeriesId',
    dataBySeriesId: 'dataBySeriesId'
  };

  render() {
    const {
      yDomainBySeriesId,
      orderedYDomains,
      orderedColors
    } = this._memoizedGetMergedYDomains(
      this.props.mergeAxesOfSameType,
      this.state.seriesIds,
      this.state.yAxisBySeriesId,
      this.state.metadataBySeriesId
    );

    return (
      <div className='default-chart'>
        <Stack className='chart-body'>
          <MetadataDrivenDataLayer
            xDomain={this.state.xAxis}
            yDomainBySeriesId={yDomainBySeriesId}
            metadataBySeriesId={this.state.metadataBySeriesId}
            dataBySeriesId={this.state.dataBySeriesId}
            seriesIds={this.state.seriesIds}
          />
          <BrushLayer
            xDomain={this.state.xAxis}
            selection={this.state.selection}
          />
          <InteractionCaptureLayer
            xDomain={this.state.xAxis}
            onHover={this._onHover}
            onPan={this._onPan}
            onZoom={this._onZoom}
            onBrush={this._onBrush}
          />
          <HoverLayer
            xDomain={this.state.xAxis}
            hover={this.state.hover}
          />
          <YAxis
            yDomains={orderedYDomains}
            colors={orderedColors}
          />
        </Stack>
        <Stack className='time-axis'>
          <XAxis
            xDomain={this.state.xAxis}
          />
        </Stack>
      </div>
    );
  }

  _memoizedGetMergedYDomains = shallowMemoize(getMergedYDomains);

  _onHover = (xPos) => {
    this.props.store.dispatch(InteractionActions.hover(xPos));
  };

  _onPan = (deltaX) => {
    this.props.store.dispatch(InteractionActions.pan(deltaX));
  };

  _onZoom = (factor, focus) => {
    this.props.store.dispatch(InteractionActions.zoom(factor, focus));
  };

  _onBrush = (brush) => {
    this.props.store.dispatch(InteractionActions.brush(brush));
  };
}

export default DefaultChart;
