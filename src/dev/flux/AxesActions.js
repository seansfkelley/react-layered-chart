import ActionType from './ActionType';

function setYDomains(yDomainBySeriesId) {
  return {
    type: ActionType.SET_SERIES_Y_DOMAIN,
    payload: yDomainBySeriesId
  };
}

export default {
  setYDomains
};
