import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import DebugBar from './debug-bar';
import DataSync from './data-sync/data-sync';
import Logger from './logger/logger';

let dataSync = null;

ReactDOM.render(
  <React.StrictMode>
    <App />
    <DebugBar />
  </React.StrictMode>,
  document.getElementById('root')
);

/**
 * Start data synchronization.
 */
function startSyncing() {
  Logger.log('info', 'Starting data synchronization');

  // Fetch config and launch data synchronization.
  fetch('./config.json')
    .then((response) => response.json())
    .then((config) => {
      dataSync = new DataSync(config.dataStrategy);
      dataSync.start();
    })
    .catch((err) => {
      Logger.log('info', 'Error staring data synchronization');
      Logger.log('error', err);

      // Retry starting synchronization after 1 min.
      setTimeout(startSyncing, 60 * 1000);
    });
}

document.addEventListener('stopDataSync', function stopDataSync() {
  if (dataSync !== null) {
    Logger.log('info', 'Stopping data synchronization');
    dataSync.stop();
    dataSync = null;
  }
});

document.addEventListener('startDataSync', function startDataSync() {
  if (dataSync === null) {
    startSyncing();
  }
});
