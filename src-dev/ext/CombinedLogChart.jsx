import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';
import memoize from 'memoizee';
import d3Scale from 'd3-scale';

import BrushLayer from '../../src/layers/BrushLayer';
import InteractionCaptureLayer from '../../src/layers/InteractionCaptureLayer';
import HoverLayer from '../../src/layers/HoverLayer';
import YAxisLayer from '../../src/layers/YAxisLayer';
import XAxisLayer from '../../src/layers/XAxisLayer';
import Stack from '../../src/Stack';
import propTypes from '../../src/propTypes';

import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.7)';

function setMetadataYScale(seriesIds, metadataBySeriesId) {
  return _.mapValues(
    _.pick(metadataBySeriesId, seriesIds),
    metadata => _.defaults({ yScale: d3Scale.scaleLog }, metadata)
  );
}

function unifyYDomains(seriesIds, yDomainBySeriesId, metadataBySeriesId) {
  if (seriesIds.length === 0) {
    return {
      unifiedYDomain: {
        min: 0.5,
        max: 15
      },
      unifiedYDomainColor: DEFAULT_COLOR,
      unifiedYDomainBySeriesId: {}
    }
  } else {
    const domains = seriesIds.map(seriesId => yDomainBySeriesId[seriesId]);
    const unifiedYDomain = {
      // Hack(-ish): log scales must be strictly positive or negative. For now, assume positive.
      // https://github.com/d3/d3-scale#log-scales
      min: Math.max(1, _.minBy(domains, 'min').min),
      max: _.maxBy(domains, 'max').max
    };

    const unifiedYDomainColor = _.reduce(
      _.map(seriesIds, seriesId => metadataBySeriesId[seriesId].color),
      (a, b) => a === b ? a : DEFAULT_COLOR
    );
    const unifiedYDomainBySeriesId = {};
    _.each(seriesIds, seriesId => unifiedYDomainBySeriesId[seriesId] = unifiedYDomain);
    return {
      unifiedYDomain,
      unifiedYDomainColor,
      unifiedYDomainBySeriesId
    };
  }
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
            scales={[ d3Scale.scaleLog ]}
            colors={[ unifiedYDomainColor ]}
          />
        </Stack>
        <Stack className='time-axis'>
          <XAxisLayer
            xDomain={this.props.xDomain}
            scale={d3Scale.scaleLinear}
          />
        </Stack>
      </div>
    );
  }
}

export default CombinedLogChart;
