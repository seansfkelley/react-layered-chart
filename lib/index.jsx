// This is cause the JSX compiles to React.createElement... hm, don't like that this dependency isn't explicitly used.
import React from 'react';

import ReactDOM from 'react-dom';
import Stack from './Stack';
import LineLayer from './LineLayer';

function fakeData() {
  const data = [];
  for (let i = 0; i < 10; ++i) {
    data.push({ timestamp: Math.random() * 10, value: Math.random() * 10 });
  }
  data.sort((a, b) => b.timestamp - a.timestamp);
  return data;
}

const data1 = fakeData();
const data2 = fakeData();

const chart = (
  <Stack>
    <LineLayer xDomain={{ start: 0, end: 10 }} yDomain={{ start: 0, end: 10 }} data={data1}/>
    <LineLayer xDomain={{ start: 0, end: 10 }} yDomain={{ start: 0, end: 10 }} data={data2}/>
  </Stack>
);

ReactDOM.render(chart, document.getElementById('test-container'));
