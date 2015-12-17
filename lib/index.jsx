// This is cause the JSX compiles to React.createElement... hm, don't like that this dependency isn't explicitly used.
import React from 'react';

import ReactDOM from 'react-dom';
import Stack from './Stack';

const chart = (
  <Stack>
    <div className='layer'>herro</div>
  </Stack>
);

ReactDOM.render(chart, document.getElementById('test-container'));
