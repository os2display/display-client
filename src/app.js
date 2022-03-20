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
  const localStorageApiTokenKey = 'apiToken';
  const localStorageScreenIdKey = 'screenId';
  const localStorageTenantKeyKey = 'tenantKey';
  const refreshTimeout = 30 * 1000;

  const [running, setRunning] = useState(false);
  const [screen, setScreen] = useState('');
  const [bindKey, setBindKey] = useState(null);
  const timeoutRef = useRef(null);

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

  const startContent = (localScreenId) => {
    setRunning(true);

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
  };

  const refreshLogin = () => {
    const localStorageToken = localStorage.getItem(localStorageApiTokenKey);
    const localScreenId = localStorage.getItem(localStorageScreenIdKey);

    if (!running && localStorageToken && localScreenId) {
      startContent(localScreenId);
    } else {
      ConfigLoader.loadConfig().then((config) => {
        fetch(config.authenticationEndpoint, {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
        })
          .then((response) => response.json())
          .then((data) => {
            if (
              data?.status === 'ready' &&
              data?.token &&
              data?.screenId &&
              data?.tenantKey
            ) {
              debugger
              localStorage.setItem(localStorageApiTokenKey, data.token);
              localStorage.setItem(localStorageScreenIdKey, data.screenId);
              localStorage.setItem(localStorageTenantKeyKey, data.tenantKey);

              startContent(data.screenId);
            } else if (data?.status === 'awaitingBindKey') {
              if (data?.bindKey) {
                setBindKey(data.bindKey);
              }
              timeoutRef.current = setTimeout(refreshLogin, refreshTimeout);
            }
          })
          .catch(() => {
            timeoutRef.current = setTimeout(refreshLogin, refreshTimeout);
          });
      });
    }
  };

  useEffect(() => {
    document.addEventListener('screen', screenHandler);

    refreshLogin();

    return function cleanup() {
      document.removeEventListener('screen', screenHandler);

      if (timeoutRef) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="App">
      {!screen && (
        <div className="BindKey">
          {bindKey && (
            <>
              <h2 className="BindKey--Header">
                Bind this machine to a screen entity in the administration to
                receive content.
              </h2>
              <h1 className="BindKey--Key">Key to enter: {bindKey}</h1>
            </>
          )}
        </div>
      )}
      {screen && <Screen screen={screen} />}
    </div>
  );
}

export default App;
