import * as React from 'react';

export const interval = React.PropTypes.shape({
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired
});

export const pointDatum = React.PropTypes.shape({
  xValue: React.PropTypes.number.isRequired,
  yValue: React.PropTypes.number.isRequired
});

export const barDatum = React.PropTypes.shape({
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

export const spanDatum = React.PropTypes.shape({
  minXValue: React.PropTypes.number.isRequired,
  maxXValue: React.PropTypes.number.isRequired
});

export const ticks = React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.number,
  React.PropTypes.arrayOf(React.PropTypes.number)
]);

export const tickFormat = React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.string
]);

export const axisSpecPartial = {
  scale: React.PropTypes.func,
  ticks: ticks,
  tickFormat: tickFormat,
  color: React.PropTypes.string
};

export const defaultChartState = React.PropTypes.shape({
  xDomain: interval,
  yDomains: React.PropTypes.objectOf(interval)
});

export default {
  interval,
  pointDatum,
  barDatum,
  bucketDatum,
  spanDatum,
  ticks,
  tickFormat,
  axisSpecPartial,
  defaultChartState
};
