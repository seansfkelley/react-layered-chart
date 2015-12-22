import ActionType from './ActionType';

function setYAxes(yAxisBySeriesId) {
  return {
    type: ActionType.SET_SERIES_Y_AXIS,
    payload: yAxisBySeriesId
  };
}

export default {
  setYAxes
};
