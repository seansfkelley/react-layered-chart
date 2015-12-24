import ActionType from './ActionType';

import _ from 'lodash';

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
  setData,
  setMetadata
};
