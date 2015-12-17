// This is cause the JSX compiles to React.createElement... hm, don't like that this dependency isn't explicitly used.
import React from 'react';

import ReactDOM from 'react-dom';
import d3 from 'd3';
import Stack from './Stack';
import LineLayer from './LineLayer';

const X_RANGE = 1000;
const Y_RANGE = 100000;

function fakeData() {
  const data = [];
  for (let i = 0; i < 10; ++i) {
    data.push({ timestamp: Math.random() * X_RANGE, value: Math.random() * Y_RANGE });
  }
  data.sort((a, b) => b.timestamp - a.timestamp);
  return data;
}

const data1 = fakeData();
const data2 = fakeData();

const chart = (
  <Stack>
    <LineLayer xDomain={{ start: 0, end: X_RANGE }} yDomain={{ start: 0, end: Y_RANGE }} data={data1}/>
    <LineLayer xDomain={{ start: 0, end: X_RANGE }} yDomain={{ start: 1, end: Y_RANGE }} yScale={d3.scale.log} data={data2}/>
  </Stack>
);

ReactDOM.render(chart, document.getElementById('test-container'));
