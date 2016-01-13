import ActionType from './ActionType';

function hover(timestamp) {
  return {
    type: ActionType.SET_HOVER,
    payload: timestamp
  };
}

const EXTENT_MAX = 1000 * 60 * 60 * 24 * 365 * 50;
const EXTENT_MIN = 1000 * 60;

// factor should be around 1 for smooth zooming
// focus must be on [0, 1]
function zoom(factor, focus = 0.5) {
  return (dispatch, getState) => {
    const currentXDomain = getState().xDomain;
    const currentExtent = currentXDomain.max - currentXDomain.min;
    const targetExtent = currentExtent * factor;
    const extentDelta = currentExtent - targetExtent;

    const xDomain = {
      min: currentXDomain.min - extentDelta * focus,
      max: currentXDomain.max + extentDelta * (1 - focus)
    };

    const extent = xDomain.max - xDomain.min;
    if (EXTENT_MAX > extent && extent > EXTENT_MIN) {
      dispatch({
        type: ActionType.SET_X_DOMAIN,
        payload: xDomain
      });
    }
  };
}

function pan(delta) {
  return (dispatch, getState) => {
    const currentXDomain = getState().xDomain;

    const xDomain = {
      min: currentXDomain.min + delta,
      max: currentXDomain.max + delta
    };

    dispatch({
      type: ActionType.SET_X_DOMAIN,
      payload: xDomain
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
