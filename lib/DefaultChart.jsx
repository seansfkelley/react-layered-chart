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

import { shallowMemoize } from './util';

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
    const yDomainsWithColors = this._getYDomainColorPairs(
      this.state.yAxisBySeriesId,
      this.state.metadataBySeriesId,
      this.state.seriesIds
    );

    const yDomainBySeriesId = {};
    _.each(yDomainsWithColors, ({ yDomain, seriesIds }) => {
      _.each(seriesIds, seriesId => yDomainBySeriesId[seriesId] = yDomain);
    });

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
            yDomains={_.pluck(yDomainsWithColors, 'yDomain')}
            colors={_.pluck(yDomainsWithColors, 'color')}
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

  _getYDomainColorPairs = shallowMemoize(function(yAxisBySeriesId, metadataBySeriesId, seriesIds) {
    if (this.props.mergeAxesOfSameType) {
      const yDomainsAndColorByUnitByUnitType = {};
      const mergedDomainColorPairs = [];

      _.each(seriesIds, seriesId => {
        const metadata = metadataBySeriesId[seriesId] || {};
        if (metadata.unit && metadata.unitType) {
          const existingMergeGroup = _.get(yDomainsAndColorByUnitByUnitType, [ metadata.unitType, metadata.unit ]);
          const yDomainAndColor = {
            yDomain: yAxisBySeriesId[seriesId],
            color: metadata.color,
            seriesIds: [ seriesId ]
          };
          if (existingMergeGroup) {
            existingMergeGroup.push(yDomainAndColor);
          } else {
            _.set(yDomainsAndColorByUnitByUnitType, [ metadata.unitType, metadata.unit ], [ yDomainAndColor ]);
          }
        } else {
          mergedDomainColorPairs.push({
            yDomain: yAxisBySeriesId[seriesId],
            color: metadata.color,
            seriesIds: [ seriesId ]
          });
        }
      });

      _.each(yDomainsAndColorByUnitByUnitType, yDomainsAndColorByUnit => {
        _.each(yDomainsAndColorByUnit, yDomainsAndColor => {
          mergedDomainColorPairs.push({
            yDomain: {
              min: _.min(_.pluck(yDomainsAndColor, 'yDomain.min')),
              max: _.max(_.pluck(yDomainsAndColor, 'yDomain.max'))
            },
            color: _.pluck(yDomainsAndColor, 'color').reduce((a, b) => a === b ? a : 'rgba(0, 0, 0, 0.7)'),
            seriesIds: _.flatten(_.pluck(yDomainsAndColor, 'seriesIds'))
          })
        });
      });

      return mergedDomainColorPairs;
    } else {
      return seriesIds.map(seriesId => ({
        yDomain: yAxisBySeriesId[seriesId],
        color: _.get(metadataBySeriesId, [ seriesId, 'color' ]),
        seriesIds: [ seriesId ]
      }));
    }
  });

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
