import * as React from 'react';

export const range = React.PropTypes.shape({
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired
});

export const dataPoint = React.PropTypes.shape({
  timestamp: React.PropTypes.number.isRequired,
  value: React.PropTypes.number.isRequired
});

export default {
  range,
  dataPoint
};
