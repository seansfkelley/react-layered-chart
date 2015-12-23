import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';

import BrushLayer from '../core/layers/BrushLayer';
import InteractionCaptureLayer from '../core/layers/InteractionCaptureLayer';
import HoverLayer from '../core/layers/HoverLayer';
import YAxisLayer from '../core/layers/YAxisLayer';
import XAxisLayer from '../core/layers/XAxisLayer';
import Stack from '../core/Stack';

import SelectFromStore from './mixins/SelectFromStore';
import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';
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
    mergeAxesOfSameType: React.PropTypes.bool,
    onPan: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onHover: React.PropTypes.func,
    onBrush: React.PropTypes.func
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
            onHover={this.props.onHover}
            onPan={this.props.onPan}
            onZoom={this.props.onZoom}
            onBrush={this.props.onBrush}
          />
          <HoverLayer
            xDomain={this.state.xAxis}
            hover={this.state.hover}
          />
          <YAxisLayer
            yDomains={orderedYDomains}
            colors={orderedColors}
          />
        </Stack>
        <Stack className='time-axis'>
          <XAxisLayer
            xDomain={this.state.xAxis}
          />
        </Stack>
      </div>
    );
  }

  _memoizedGetMergedYDomains = shallowMemoize(getMergedYDomains);
}

export default DefaultChart;
