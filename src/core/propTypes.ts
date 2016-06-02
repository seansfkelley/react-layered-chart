import * as React from 'react';

export const range = React.PropTypes.shape({
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired
});

export const pointDatum = React.PropTypes.shape({
  xValue: React.PropTypes.number.isRequired,
  yValue: React.PropTypes.number.isRequired
});

export const spanDatum = React.PropTypes.shape({
  minXValue: React.PropTypes.number.isRequired,
  maxXValue: React.PropTypes.number.isRequired,
  yValue: React.PropTypes.number.isRequired
});

export const bucketDatum = React.PropTypes.shape({
  minXValue: React.PropTypes.number.isRequired,
  maxXValue: React.PropTypes.number.isRequired,
  minYValue: React.PropTypes.number.isRequired,
  maxYValue: React.PropTypes.number.isRequired,
  firstYValue: React.PropTypes.number.isRequired,
  lastYValue: React.PropTypes.number.isRequired
});

export default {
  range,
  pointDatum,
  spanDatum,
  bucketDatum
};
