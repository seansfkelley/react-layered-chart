import * as _ from 'lodash';

import { Range, SeriesData } from '../core';
import { SeriesId, TBySeriesId, DataLoader } from './interfaces';

export function createStaticDataLoader(
  dataBySeriesId: TBySeriesId<SeriesData>,
  yDomainBySeriesId: TBySeriesId<Range>
): DataLoader {
  return () => {
    return _.mapValues(dataBySeriesId, (data, seriesId) =>
      new Promise((resolve, reject) => {
        resolve({
          data,
          yDomain: yDomainBySeriesId[seriesId]
        });
      })
    )
  };
}
