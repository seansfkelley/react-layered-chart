import ActionType from './ActionType';

function setYAxes(yAxisBySeriesId) {
  return {
    type: ActionType.SET_Y_AXIS,
    payload: yAxisBySeriesId
  };
}

export default {
  setYAxes
};
