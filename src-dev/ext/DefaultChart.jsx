import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';
import memoize from 'memoizee';

import BrushLayer from '../../src/layers/BrushLayer';
import InteractionCaptureLayer from '../../src/layers/InteractionCaptureLayer';
import HoverLayer from '../../src/layers/HoverLayer';
import YAxisLayer from '../../src/layers/YAxisLayer';
import XAxisLayer from '../../src/layers/XAxisLayer';
import Stack from '../../src/Stack';
import propTypes from '../../src/propTypes';

import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';
import { mergeRangesOfSameType } from './util';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.7)';

function getMergedYDomains(shouldMerge, seriesIds, yDomainBySeriesId, metadataBySeriesId) {
  if (seriesIds.length === 0) {
    return {
      mergedYDomainBySeriesId: {},
      orderedYDomains: [{
        min: -1.25,
        max: 1.25
      }],
      orderedColors: [ DEFAULT_COLOR ]
    };
  } else {
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

    return {
      mergedYDomainBySeriesId,
      orderedYDomains: _.pluck(rangeGroups, 'range'),
      orderedColors: _.pluck(rangeGroups, 'color')
    }
  }
}

const memoizedGetMergedYDomains = memoize(getMergedYDomains, { max: 10 });

@PureRender
class DefaultChart extends React.Component {
  static propTypes = {
    seriesIds: React.PropTypes.arrayOf(React.PropTypes.string),
    xDomain: propTypes.range,
    yDomainBySeriesId: React.PropTypes.objectOf(propTypes.range),
    metadataBySeriesId: React.PropTypes.object,
    dataBySeriesId: React.PropTypes.object,
    selection: propTypes.range,
    hover: React.PropTypes.number,

    mergeAxesOfSameType: React.PropTypes.bool,
    onPan: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onHover: React.PropTypes.func,
    onBrush: React.PropTypes.func
  };

  static defaultProps = {
    seriesIds: [],
    xDomain: { min: 0, max: 0 },
    yDomainBySeriesId: {},
    metadataBySeriesId: {},
    dataBySeriesId: {},
    mergeAxesOfSameType: true
  };

  render() {
    const {
      mergedYDomainBySeriesId,
      orderedYDomains,
      orderedColors
    } = memoizedGetMergedYDomains(
      this.props.mergeAxesOfSameType,
      this.props.seriesIds,
      this.props.yDomainBySeriesId,
      this.props.metadataBySeriesId
    );

    return (
      <div className='default-chart'>
        <Stack className='chart-body'>
          <MetadataDrivenDataLayer
            xDomain={this.props.xDomain}
            yDomainBySeriesId={mergedYDomainBySeriesId}
            metadataBySeriesId={this.props.metadataBySeriesId}
            dataBySeriesId={this.props.dataBySeriesId}
            seriesIds={this.props.seriesIds}
          />
          <BrushLayer
            xDomain={this.props.xDomain}
            selection={this.props.selection}
          />
          <InteractionCaptureLayer
            xDomain={this.props.xDomain}
            onHover={this.props.onHover}
            onPan={this.props.onPan}
            onZoom={this.props.onZoom}
            onBrush={this.props.onBrush}
          />
          <HoverLayer
            xDomain={this.props.xDomain}
            hover={this.props.hover}
          />
          <YAxisLayer
            yDomains={orderedYDomains}
            colors={orderedColors}
          />
        </Stack>
        <Stack className='time-axis'>
          <XAxisLayer
            xDomain={this.props.xDomain}
          />
        </Stack>
      </div>
    );
  }
}

export default DefaultChart;
