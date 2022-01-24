import { React, useEffect, useRef, useState } from 'react';
import Screen from './screen';
import './app.scss';
import ContentService from './service/contentService';
import ConfigLoader from './config-loader';

/**
 * App component.
 *
 * @returns {object}
 *   The component.
 */
function App() {
  const [screenId, setScreenId] = useState(null);
  const [screen, setScreen] = useState('');
  const [token, setToken] = useState(null);
  const [bindKey, setBindKey] = useState(null);
  const timeoutRef = useRef();

  /**
   * Handles "screen" events.
   *
   * @param {CustomEvent} event
   *   The event.
   */
  function screenHandler(event) {
    const screenData = event.detail?.screen;

    if (screenData !== null) {
      setScreen(screenData);
    }
  }

  const refreshLogin = () => {
    const localStorageToken = localStorage.getItem('api-token');
    const localScreenId = localStorage.getItem('screen-id');

    if (localStorageToken && localScreenId) {
      setToken(localStorageToken);
      setScreenId(localScreenId);

      // Start the content service.
      const contentService = new ContentService();
      contentService.start();

      const entrypoint = `/v1/screens/${localScreenId}`;

      document.dispatchEvent(
        new CustomEvent('startDataSync', {
          detail: {
            screenPath: entrypoint,
          },
        })
      );
    } else {
      timeoutRef.current = setTimeout(refreshLogin, 1000 * 30);

      ConfigLoader.loadConfig().then((config) => {
        fetch(config.authenticationEndpoint, {
          method: 'POST',
        })
          .then((response) => response.json())
          .then((data) => {
            if (data?.status === 'awaitingBindKey' && data?.bindKey) {
              setBindKey(data.bindKey);
            }
            if (data?.status === 'ready') {
              localStorage.setItem('api-token', data.token);
              localStorage.setItem('screen-id', data.screenId);
            }
          });
      });
    }
  };

  useEffect(() => {
    document.addEventListener('screen', screenHandler);

    refreshLogin();

    return function cleanup() {
      document.removeEventListener('screen', screenHandler);
    };
  }, []);

  return (
    <div className="App">
      {bindKey && <div style={{ color: 'wheat' }}>{bindKey}</div>}
      {!token && <></>}
      {screen && <Screen screen={screen} />}
    </div>
  );
}

export default App;
