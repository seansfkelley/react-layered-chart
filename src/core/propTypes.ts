import * as React from 'react';

export const range = React.PropTypes.shape({
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired
});

export const spanDatum = React.PropTypes.shape({
  span: range.isRequired,
  value: React.PropTypes.number.isRequired
});

export const pointDatum = React.PropTypes.shape({
  xValue: React.PropTypes.number.isRequired,
  yValue: React.PropTypes.number.isRequired
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
  spanDatum,
  pointDatum,
  timeBucketDatum
};
