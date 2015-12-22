import ActionType from './ActionType';

function setYAxis(yAxis) {
  return {
    type: ActionType.SET_Y_AXIS,
    payload: yAxis
  };
}

export default {
  setYAxis
};
