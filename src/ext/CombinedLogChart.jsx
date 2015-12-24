import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';
import memoize from 'memoizee';
import d3Scale from 'd3-scale';

import BrushLayer from '../core/layers/BrushLayer';
import InteractionCaptureLayer from '../core/layers/InteractionCaptureLayer';
import HoverLayer from '../core/layers/HoverLayer';
import YAxisLayer from '../core/layers/YAxisLayer';
import XAxisLayer from '../core/layers/XAxisLayer';
import Stack from '../core/Stack';

import SelectFromStore from './mixins/SelectFromStore';
import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';

function setMetadataYScale(seriesIds, metadataBySeriesId) {
  return _.chain(metadataBySeriesId)
    .pick(seriesIds)
    .mapValues(metadata => _.defaults({ yScale: d3Scale.log }, metadata))
    .value();
}

function unifyYDomains(seriesIds, yDomainBySeriesId, metadataBySeriesId) {
  const domains = seriesIds.map(seriesId => yDomainBySeriesId[seriesId]);
  const unifiedYDomain = {
    // Hack(-ish): log scales must be strictly positive or negative. For now, assume positive.
    // https://github.com/d3/d3-scale#log-scales
    min: Math.max(1, _.min(domains, 'min').min),
    max: _.max(domains, 'max').max
  };
  const unifiedYDomainColor = seriesIds
    .map(seriesId => metadataBySeriesId[seriesId].color)
    .reduce((a, b) => a === b ? a : 'rgba(0, 0, 0, 0.7)');
  const unifiedYDomainBySeriesId = {};
  _.each(seriesIds, seriesId => unifiedYDomainBySeriesId[seriesId] = unifiedYDomain);
  return {
    unifiedYDomain,
    unifiedYDomainColor,
    unifiedYDomainBySeriesId
  };
}

const memoizedSetMetadataYScale = memoize(setMetadataYScale, { max: 10 });
const memoizedUnifyYDomains = memoize(unifyYDomains, { max: 10 });

@PureRender
@SelectFromStore
class CombinedLogChart extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired,
    onPan: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onHover: React.PropTypes.func,
    onBrush: React.PropTypes.func
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
    const metadataBySeriesIdWithScale = memoizedSetMetadataYScale(
      this.state.seriesIds,
      this.state.metadataBySeriesId
    );

    const {
      unifiedYDomain,
      unifiedYDomainColor,
      unifiedYDomainBySeriesId
    } = memoizedUnifyYDomains(
      this.state.seriesIds,
      this.state.yDomainBySeriesId,
      this.state.metadataBySeriesId
    );

    return (
      <div className='log-chart'>
        <Stack className='chart-body'>
          <MetadataDrivenDataLayer
            xDomain={this.state.xDomain}
            yDomainBySeriesId={unifiedYDomainBySeriesId}
            metadataBySeriesId={metadataBySeriesIdWithScale}
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
            yDomains={[ unifiedYDomain ]}
            scales={[ d3Scale.log ]}
            colors={[ unifiedYDomainColor ]}
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

export default CombinedLogChart;
