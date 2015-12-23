import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';
import memoize from 'memoizee';

import BrushLayer from '../core/layers/BrushLayer';
import InteractionCaptureLayer from '../core/layers/InteractionCaptureLayer';
import HoverLayer from '../core/layers/HoverLayer';
import YAxisLayer from '../core/layers/YAxisLayer';
import XAxisLayer from '../core/layers/XAxisLayer';
import Stack from '../core/Stack';

import SelectFromStore from './mixins/SelectFromStore';
import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';
import { mergeRangesOfSameType } from './util';

function getMergedYDomains(shouldMerge, seriesIds, yDomainBySeriesId, metadataBySeriesId) {
  const rangeGroups = shouldMerge
    ? mergeRangesOfSameType(seriesIds, yDomainBySeriesId, metadataBySeriesId)
    : seriesIds.map(seriesId => ({
        range: yDomainBySeriesId[seriesId],
        color: _.get(metadataBySeriesId, [ seriesId, 'color' ]),
        seriesIds: [ seriesId ]
      }));

  let mergedYDomainBySeriesId = {};
  _.each(rangeGroups, ({ seriesIds, range }) =>
    _.each(seriesIds, seriesId => mergedYDomainBySeriesId[seriesId] = range)
  );

  const filteredRangeGroups = rangeGroups.filter(rangeGroup => {
    return _.any(rangeGroup.seriesIds, seriesId => {
      const showYAxis = _.get(metadataBySeriesId, [ seriesId, 'showYAxis' ]);
      return _.isUndefined(showYAxis) ? true : showYAxis;
    });
  });

  return {
    mergedYDomainBySeriesId,
    orderedYDomains: _.pluck(filteredRangeGroups, 'range'),
    orderedColors: _.pluck(filteredRangeGroups, 'color')
  }
}

function resolveInheritedYDomains(seriesIds, metadataBySeriesId, yDomainBySeriesId) {
  const inheritedYDomainBySeriesId = _.clone(yDomainBySeriesId);
  _.each(seriesIds, seriesId => {
    const inheritYDomainFromId = metadataBySeriesId[seriesId].inheritYDomainFrom;
    if (inheritYDomainFromId) {
      inheritedYDomainBySeriesId[seriesId] = yDomainBySeriesId[inheritYDomainFromId];
    }
  });
  return inheritedYDomainBySeriesId;
}

function resolveInheritedMetadata(seriesIds, metadataBySeriesId) {
  const inheritedMetadataBySeriesId = _.clone(metadataBySeriesId);
  _.each(seriesIds, seriesId => {
    const inheritMetadataFromId = metadataBySeriesId[seriesId].inheritMetadataFrom;
    if (inheritMetadataFromId) {
      inheritedMetadataBySeriesId[seriesId] = _.extend(
        {},
        metadataBySeriesId[inheritMetadataFromId],
        metadataBySeriesId[seriesId]
      );
    }
  });
  return inheritedMetadataBySeriesId;
}

const memoizedGetMergedYDomains = memoize(getMergedYDomains, { max: 10 });
const memoizedResolveInheritedYDomains = memoize(resolveInheritedYDomains, { max: 10 });
const memoizedResolveInheritedMetadata = memoize(resolveInheritedMetadata, { max: 10 });

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
    mergeAxesOfSameType: false
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
    const resolvedMetadataBySeriesId = memoizedResolveInheritedMetadata(
      this.state.seriesIds,
      this.state.metadataBySeriesId
    );

    const resolvedYDomainBySeriesId = memoizedResolveInheritedYDomains(
      this.state.seriesIds,
      resolvedMetadataBySeriesId,
      this.state.yAxisBySeriesId
    );

    const {
      mergedYDomainBySeriesId,
      orderedYDomains,
      orderedColors
    } = memoizedGetMergedYDomains(
      this.props.mergeAxesOfSameType,
      this.state.seriesIds,
      resolvedYDomainBySeriesId,
      resolvedMetadataBySeriesId
    );

    return (
      <div className='default-chart'>
        <Stack className='chart-body'>
          <MetadataDrivenDataLayer
            xDomain={this.state.xAxis}
            yDomainBySeriesId={mergedYDomainBySeriesId}
            metadataBySeriesId={resolvedMetadataBySeriesId}
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
}

export default DefaultChart;
