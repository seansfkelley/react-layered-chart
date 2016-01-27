import ActionType from './ActionType';
import { resolvePan, resolveZoom } from '../../../src/util';

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
    const xDomain = resolveZoom(getState().xDomain, factor, focus);
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
    const xDomain = resolvePan(getState().xDomain, delta);
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
