// This is cause the JSX compiles to React.createElement... hm, don't like that this dependency isn't explicitly used.
import React from 'react';

import ReactDOM from 'react-dom';
import Stack from './Stack';
import LineLayer from './LineLayer';

const DATA = [
  { timestamp: -1, value: Math.random() * 10 },
  { timestamp: 1, value: Math.random() * 10 },
  { timestamp: 2, value: Math.random() * 10 },
  { timestamp: 4, value: Math.random() * 10 },
  { timestamp: 6, value: Math.random() * 10 },
  { timestamp: 8, value: Math.random() * 10 },
  { timestamp: 9, value: Math.random() * 10 },
  { timestamp: 9.5, value: Math.random() * 10 },
  { timestamp: 10, value: Math.random() * 10 }
];

const chart = (
  <Stack>
    <LineLayer xDomain={{ start: 0, end: 10 }} yDomain={{ start: 0, end: 10 }} data={DATA}/>
  </Stack>
);

ReactDOM.render(chart, document.getElementById('test-container'));
