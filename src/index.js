import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import DebugBar from './debug-bar';

ReactDOM.render(
  <React.StrictMode>
    <App />
    <DebugBar />
  </React.StrictMode>,
  document.getElementById('root'),
);
