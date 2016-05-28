import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';
import { Range, Stack, layers } from 'react-layered-chart';
const {
  BucketedLineLayer,
  PointLayer
} = layers;

import LayerType from '../model/LayerType';
import { DEFAULT_Y_DOMAIN } from '../model/constants';
import { SeriesId, TBySeriesId, StateSelector } from '../model/typedefs';
import { SeriesMetadata, ChartState } from '../model/state';
import { selectXDomain, selectYDomains } from '../model/selectors';
import { LayerCakeChartState } from '../export-only/exportableState';
import {
  getStartTimeByLayerType,
  getEndTimeByLayerType,
  getMaxValueByLayerType,
  getMinValueByLayerType
} from '../dataUtils';

export interface OwnProps {
  seriesIds: SeriesId[];
  hoverDataSelector?: StateSelector<TBySeriesId<any>>;
}

export interface ConnectedProps {
  metadataBySeriesId: TBySeriesId<SeriesMetadata>;
  dataBySeriesId: TBySeriesId<any[]>;
  xDomain: Range;
  yDomainBySeriesId: TBySeriesId<Range>;
  hoveredDataBySeriesId: TBySeriesId<any>;
}

@PureRender
export class StackedSeriesLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <Stack className='lc-layer'>
        {this.props.seriesIds.map(this._renderLayer)}
      </Stack>
    );
  }

  private _renderLayer = (seriesId: SeriesId): React.ReactNode => {
    const metadata = this.props.metadataBySeriesId[seriesId];

    if (!metadata) {
      console.error(`Cannot render series ${seriesId} because it does not specify any metadata.`);
      return null;
    }

    const commonProps = {
      xDomain: this.props.xDomain,
      yDomain: this.props.yDomainBySeriesId[ seriesId ] || DEFAULT_Y_DOMAIN
    };

    const dataLayerProps = {
      key: seriesId,
      data: this.props.dataBySeriesId[ seriesId ] || []
    };

    const pointLayerProps = {
      radius: 3
    };

    let hoverLayerProps;
    if (this.props.hoverDataSelector) {
      const datum = this.props.hoveredDataBySeriesId[seriesId];
      if (datum) {
        const timestamp = (getStartTimeByLayerType(metadata.layerType, datum) + getEndTimeByLayerType(metadata.layerType, datum)) / 2;

        const minValue = getMinValueByLayerType(metadata.layerType, datum);
        const maxValue = getMaxValueByLayerType(metadata.layerType, datum);

        const data = minValue === maxValue
          ? [ { timestamp, value: minValue } ]
          : [ { timestamp, value: minValue }, { timestamp, value: maxValue }];

        hoverLayerProps = {
          key: seriesId + '~hover',
          data,
          innerRadius: 6,
          radius: 7
        };
      }
    }

    let dataLayer;
    switch (metadata.layerType) {
      case LayerType.LINE:
        dataLayer = <BucketedLineLayer {...commonProps} {...dataLayerProps} {...metadata}/>;
        break;

      case LayerType.POINT:
        dataLayer = <PointLayer {...commonProps} {...pointLayerProps} {...dataLayerProps} {...metadata}/>;
        break;

      default:
        console.error(`Cannot render series ${seriesId} with unknown LayerType ${metadata.layerType}.`);
        return null;
    }

    return [
      dataLayer,
      hoverLayerProps ? <PointLayer {...commonProps} {...pointLayerProps} {...hoverLayerProps} {...metadata}/> : null
    ];
  };
}

function mapStateToProps(state: ChartState, ownProps: OwnProps): ConnectedProps {
  return {
    metadataBySeriesId: state.metadataBySeriesId,
    dataBySeriesId: state.dataBySeriesId,
    xDomain: selectXDomain(state),
    yDomainBySeriesId: selectYDomains(state),
    // This cast is alright; the fake branded type we take in hoverDataSelector's signature is to prevent exposing the
    // underlying ChartState to the consumer.
    hoveredDataBySeriesId: ownProps.hoverDataSelector ? ownProps.hoverDataSelector(state as any as LayerCakeChartState) : {}
  };
}

export default connect(mapStateToProps)(StackedSeriesLayer) as React.ComponentClass<OwnProps>;
