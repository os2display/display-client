import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import DebugBar from './debug-bar';
import Engine from './engine/engine';

ReactDOM.render(
  <React.StrictMode>
    <App />
    <DebugBar />
  </React.StrictMode>,
  document.getElementById('root')
);

// Start the engine.
const engine = new Engine();
engine.start();
