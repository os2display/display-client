import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import DebugBar from './debug-bar';
import * as serviceWorkerRegistration from './service-worker-registration';

ReactDOM.render(
  <React.StrictMode>
    <App />
    <DebugBar />
  </React.StrictMode>,
  document.getElementById('root')
);

// Enable service worker.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// @TODO: Remove this example code.
setTimeout(function update() {
  const cacheResources = [
    'http://display-client.local.itkdev.dk:3002/fixtures/image1.jpeg',
    'http://display-client.local.itkdev.dk:3002/fixtures/video1.webm'
  ];

  cacheResources.forEach((resource) => {
    // @TODO: Check for existence in cache to avoid fetching unnecessarily.
    fetch(resource).then(
      () => console.log(`${resource} fetch success`),
      () => console.log(`${resource} fetch failed`)
    );
  });
}, 5000);

// @TODO: Remove this example code.
setTimeout(function update() {
  const event = new CustomEvent('content', {
    detail: {
      name: 'Data pull example',
      image: 'http://display-client.local.itkdev.dk:3002/fixtures/image1.jpeg',
      video: 'http://display-client.local.itkdev.dk:3002/fixtures/video1.webm',
      cacheResources: [
        'http://display-client.local.itkdev.dk:3002/fixtures/image1.jpeg',
        'http://display-client.local.itkdev.dk:3002/fixtures/video1.webm'
      ]
    }
  });
  document.dispatchEvent(event);
}, 10000);
