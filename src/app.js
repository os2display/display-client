import { React, useEffect, useRef, useState } from 'react';
import Screen from './screen';
import './app.scss';
import ContentService from './service/contentService';
import ConfigLoader from './config-loader';
import { ulid } from 'ulid';

/**
 * App component.
 *
 * @returns {object}
 *   The component.
 */
function App() {
  const localStorageApiTokenKey = 'apiToken';
  const localStorageScreenIdKey = 'screenId';
  const localStorageUniqueLoginIdKey = 'uniqueLoginId';

  const [screen, setScreen] = useState('');
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
    const localStorageToken = localStorage.getItem(localStorageApiTokenKey);
    const localScreenId = localStorage.getItem(localStorageScreenIdKey);
    const localStorageUniqueLoginId = localStorage.getItem(
      localStorageUniqueLoginIdKey
    );

    if (localStorageToken && localScreenId) {
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

      let requestLoginId = localStorageUniqueLoginId;

      if (!localStorageUniqueLoginId) {
        console.log('not');
        requestLoginId = ulid();
        localStorage.setItem(localStorageUniqueLoginIdKey, requestLoginId);
      }

      console.log(requestLoginId);

      ConfigLoader.loadConfig().then((config) => {
        fetch(config.authenticationEndpoint, {
          method: 'POST',
          body: JSON.stringify({
            uniqueLoginId: requestLoginId,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data?.status === 'awaitingBindKey' && data?.bindKey) {
              setBindKey(data.bindKey);
            }
            if (data?.status === 'ready' && data?.token && data?.screenId) {
              localStorage.setItem(localStorageApiTokenKey, data.token);
              localStorage.setItem(localStorageScreenIdKey, data.screenId);
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
