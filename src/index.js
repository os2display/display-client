import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import DebugBar from './debug-bar';
import DataSync from './dataSync';

let dataSync = null;

ReactDOM.render(
  <React.StrictMode>
    <App />
    <DebugBar />
  </React.StrictMode>,
  document.getElementById('root')
);

function startSyncing() {
  fetch('./config.json')
    .then((response) => response.json())
    .then((config) => {
      dataSync = new DataSync(config.dataStrategy);
      dataSync.start();
    });
}

startSyncing();
