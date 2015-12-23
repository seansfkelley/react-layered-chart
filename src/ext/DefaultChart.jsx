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

const memoizedGetMergedYDomains = memoize(getMergedYDomains, { max: 10 });

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
    xDomain: 'xDomain',
    seriesIds: 'seriesIds',
    yDomainBySeriesId: 'yDomainBySeriesId',
    metadataBySeriesId: 'metadataBySeriesId',
    dataBySeriesId: 'dataBySeriesId'
  };

  render() {
    const {
      mergedYDomainBySeriesId,
      orderedYDomains,
      orderedColors
    } = memoizedGetMergedYDomains(
      this.props.mergeAxesOfSameType,
      this.state.seriesIds,
      this.state.yDomainBySeriesId,
      this.state.metadataBySeriesId
    );

    return (
      <div className='default-chart'>
        <Stack className='chart-body'>
          <MetadataDrivenDataLayer
            xDomain={this.state.xDomain}
            yDomainBySeriesId={mergedYDomainBySeriesId}
            metadataBySeriesId={this.state.metadataBySeriesId}
            dataBySeriesId={this.state.dataBySeriesId}
            seriesIds={this.state.seriesIds}
          />
          <BrushLayer
            xDomain={this.state.xDomain}
            selection={this.state.selection}
          />
          <InteractionCaptureLayer
            xDomain={this.state.xDomain}
            onHover={this.props.onHover}
            onPan={this.props.onPan}
            onZoom={this.props.onZoom}
            onBrush={this.props.onBrush}
          />
          <HoverLayer
            xDomain={this.state.xDomain}
            hover={this.state.hover}
          />
          <YAxisLayer
            yDomains={orderedYDomains}
            colors={orderedColors}
          />
        </Stack>
        <Stack className='time-axis'>
          <XAxisLayer
            xDomain={this.state.xDomain}
          />
        </Stack>
      </div>
    );
  }
}

export default DefaultChart;
