import ActionType from './ActionType';

function hover(timestamp) {
  return {
    type: ActionType.SET_HOVER,
    payload: timestamp
  };
}

// factor should be around 1 for smooth zooming
// focus must be on [0, 1]
function zoom(factor, focus = 0.5) {
  return (dispatch, getState) => {
    const currentXDomain = getState().xDomain;
    const currentExtent = currentXDomain.max - currentXDomain.min;
    const targetExtent = currentExtent * factor;
    const extentDelta = currentExtent - targetExtent;

    const payload = {
      min: currentXDomain.min - extentDelta * focus,
      max: currentXDomain.max + extentDelta * (1 - focus)
    };

    dispatch({
      type: ActionType.SET_X_DOMAIN,
      payload
    });
  };
}

function pan(delta) {
  return (dispatch, getState) => {
    const currentXDomain = getState().xDomain;

    const payload = {
      min: currentXDomain.min + delta,
      max: currentXDomain.max + delta
    };

    dispatch({
      type: ActionType.SET_X_DOMAIN,
      payload
    });
  };
}

function brush(brushExtent) {
  return {
    type: ActionType.SET_SELECTION,
    payload: brushExtent
  };
}

export default {
  zoom,
  pan,
  brush,
  hover
};
