import React from 'react';

export const domain = React.PropTypes.shape({
  start: React.PropTypes.number.isRequired,
  end: React.PropTypes.number.isRequired
});

export const timeSpan = React.PropTypes.shape({
  start: React.PropTypes.number.isRequired,
  end: React.PropTypes.number.isRequired
});

export const dataPoint = React.PropTypes.shape({
  timestamp: React.PropTypes.number.isRequired,
  value: React.PropTypes.number.isRequired
});

export default {
  domain,
  timeSpan,
  dataPoint
};
