import jwtDecode from 'jwt-decode';
import { React, useEffect, useRef, useState } from 'react';
import Screen from './screen';
import './app.scss';
import ContentService from './service/contentService';
import ConfigLoader from './config-loader';
import Logger from './logger/logger';

/**
 * App component.
 *
 * @returns {object}
 *   The component.
 */
function App() {
  const lsApiToken = 'apiToken';
  const lsApiTokenExpire = 'apiTokenExpire';
  const lsApiTokenIssuedAt = 'apiTokenIssuedAt';
  const lsScreenId = 'screenId';
  const lsTenantKey = 'tenantKey';
  const lsRefreshToken = 'refreshToken';
  const refreshTimeout = 30 * 1000;

  const [running, setRunning] = useState(false);
  const [screen, setScreen] = useState('');
  const [bindKey, setBindKey] = useState(null);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const timeoutRef = useRef(null);
  const refreshTokenIntervalRef = useRef(null);

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
    const localStorageToken = localStorage.getItem(lsApiToken);
    const localScreenId = localStorage.getItem(lsScreenId);

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
              data?.tenantKey &&
              data?.refreshToken
            ) {
              const decodedToken = jwtDecode(data.token);

              localStorage.setItem(lsApiToken, data.token);
              localStorage.setItem(lsApiTokenExpire, decodedToken.exp);
              localStorage.setItem(lsApiTokenIssuedAt, decodedToken.iat);
              localStorage.setItem(lsScreenId, data.screenId);
              localStorage.setItem(lsTenantKey, data.tenantKey);
              localStorage.setItem(lsRefreshToken, data.refreshToken);

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

  const checkToken = () => {
    Logger.info('Refresh token check');

    // Ignore if already refreshing token.
    if (refreshingToken) {
      return;
    }

    const rToken = localStorage.getItem(lsRefreshToken);
    const exp = parseInt(localStorage.getItem(lsApiTokenExpire), 10);
    const iat = parseInt(localStorage.getItem(lsApiTokenIssuedAt), 10);

    if (!rToken || !exp || !iat) {
      Logger.warning('Refresh token, exp or iat not set.');
      return;
    }

    const timeDiff = exp - iat;

    const now = Math.floor(new Date().getTime() / 1000);

    // If more than half the time till expire has been passed refresh the token.
    if (now > iat + timeDiff / 2) {
      setRefreshingToken(true);
      Logger.info('Refreshing token.');

      ConfigLoader.loadConfig().then((config) => {
        fetch(config.authenticationRefreshTokenEndpoint, {
          method: 'POST',
          body: JSON.stringify({
            refresh_token: rToken,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            Logger.info('Token refreshed.');

            const decodedToken = jwtDecode(data.token);

            localStorage.setItem(lsApiToken, data.token);
            localStorage.setItem(lsApiTokenExpire, decodedToken.exp);
            localStorage.setItem(lsApiTokenIssuedAt, decodedToken.iat);
            localStorage.setItem(lsRefreshToken, data.refresh_token);
          })
          .catch(() => {
            Logger.error('Token refresh error.');
          })
          .finally(() => {
            setRefreshingToken(false);
          });
      });
    }
  };

  const reauthenticateHandler = () => {
    localStorage.removeItem(lsApiToken);
    localStorage.removeItem(lsApiTokenExpire);
    localStorage.removeItem(lsApiTokenIssuedAt);
    localStorage.removeItem(lsRefreshToken);
    localStorage.removeItem(lsScreenId);
    localStorage.removeItem(lsTenantKey);

    setScreen('');
  };

  useEffect(() => {
    document.addEventListener('screen', screenHandler);
    document.addEventListener('reauthenticate', reauthenticateHandler);

    refreshLogin();

    refreshTokenIntervalRef.current = setInterval(checkToken, refreshTimeout);

    return function cleanup() {
      document.removeEventListener('screen', screenHandler);
      document.removeEventListener('reauthenticate', reauthenticateHandler);

      if (timeoutRef) {
        clearTimeout(timeoutRef.current);
      }

      if (refreshTokenIntervalRef) {
        clearInterval(refreshTokenIntervalRef.current);
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
