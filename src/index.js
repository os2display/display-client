import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import DebugBar from './debug-bar';
import ContentService from './service/contentService';

ReactDOM.render(
  <React.StrictMode>
    <App />
    <DebugBar />
  </React.StrictMode>,
  document.getElementById('root')
);

// Start the content service.
const contentService = new ContentService();
contentService.start();
