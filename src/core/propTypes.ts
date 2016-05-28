import * as React from 'react';

export const range = React.PropTypes.shape({
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired
});

export const timeSpanDatum = React.PropTypes.shape({
  timeSpan: range.isRequired,
  value: React.PropTypes.number.isRequired
});

export const timestampDatum = React.PropTypes.shape({
  timestamp: React.PropTypes.number.isRequired,
  value: React.PropTypes.number.isRequired
});

export const timeBucketDatum = React.PropTypes.shape({
  startTime: React.PropTypes.number.isRequired,
  endTime: React.PropTypes.number.isRequired,
  minValue: React.PropTypes.number.isRequired,
  maxValue: React.PropTypes.number.isRequired,
  firstValue: React.PropTypes.number.isRequired,
  lastValue: React.PropTypes.number.isRequired
});

export default {
  range,
  timeSpanDatum,
  timestampDatum,
  timeBucketDatum
};
