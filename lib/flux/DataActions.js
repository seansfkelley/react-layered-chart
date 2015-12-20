import ActionType from './ActionType';

import _ from 'lodash';

function addSeries(...seriesIds) {
  const payload = _.flatten(seriesIds);
  return {
    type: ActionType.ADD_SERIES,
    payload
  };
}

function setData(dataBySeriesId) {
  return {
    type: ActionType.SET_SERIES_DATA,
    payload: dataBySeriesId
  };
}

function setMetadata(metadataBySeriesId) {
  return {
    type: ActionType.SET_SERIES_METADATA,
    payload: metadataBySeriesId
  };
}

export default {
  addSeries,
  setData,
  setMetadata
};
