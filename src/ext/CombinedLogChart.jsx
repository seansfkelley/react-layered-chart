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
import propTypes from '../core/propTypes';

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
class CombinedLogChart extends React.Component {
  static propTypes = {
    seriesIds: React.PropTypes.arrayOf(React.PropTypes.string),
    xDomain: propTypes.range,
    yDomainBySeriesId: React.PropTypes.objectOf(propTypes.range),
    metadataBySeriesId: React.PropTypes.object,
    dataBySeriesId: React.PropTypes.object,
    selection: propTypes.range,
    hover: React.PropTypes.number,

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
    dataBySeriesId: {}
  };

  render() {
    const metadataBySeriesIdWithScale = memoizedSetMetadataYScale(
      this.props.seriesIds,
      this.props.metadataBySeriesId
    );

    const {
      unifiedYDomain,
      unifiedYDomainColor,
      unifiedYDomainBySeriesId
    } = memoizedUnifyYDomains(
      this.props.seriesIds,
      this.props.yDomainBySeriesId,
      this.props.metadataBySeriesId
    );

    return (
      <div className='log-chart'>
        <Stack className='chart-body'>
          <MetadataDrivenDataLayer
            xDomain={this.props.xDomain}
            yDomainBySeriesId={unifiedYDomainBySeriesId}
            metadataBySeriesId={metadataBySeriesIdWithScale}
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
            yDomains={[ unifiedYDomain ]}
            scales={[ d3Scale.log ]}
            colors={[ unifiedYDomainColor ]}
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

export default CombinedLogChart;
