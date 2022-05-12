import jwtDecode from 'jwt-decode';
import { React, useEffect, useRef, useState } from 'react';
import Screen from './screen';
import ContentService from './service/contentService';
import ConfigLoader from './config-loader';
import ReleaseLoader from './release-loader';
import Logger from './logger/logger';
import './app.scss';

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
  const loginCheckTimeout = 15 * 1000;
  const refreshTimeout = 60 * 1000;
  const releaseTimestampIntervalTimeout = 1000 * 60 * 5;

  const [running, setRunning] = useState(false);
  const [screen, setScreen] = useState('');
  const [bindKey, setBindKey] = useState(null);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const timeoutRef = useRef(null);
  const refreshTokenIntervalRef = useRef(null);
  const contentServiceRef = useRef(null);
  const releaseTimestampRef = useRef(null);
  const releaseTimestampIntervalRef = useRef(null);

  // ctrl/cmd i will log screen out and refresh
  const handleKeyboard = ({ repeat, metaKey, key, ctrlKey }) => {
    if (!repeat && (metaKey || ctrlKey) && key === 'i') {
      localStorage.clear();
      window.location.reload(false);
    }
  };

  document.addEventListener('keypress', handleKeyboard);

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

  const checkToken = () => {
    Logger.log('info', 'Refresh token check');

    // Ignore if already refreshing token.
    if (refreshingToken) {
      Logger.log('info', 'Already refreshing token.');
      return;
    }

    const rToken = localStorage.getItem(lsRefreshToken);
    const exp = parseInt(localStorage.getItem(lsApiTokenExpire), 10);
    const iat = parseInt(localStorage.getItem(lsApiTokenIssuedAt), 10);

    if (!rToken || !exp || !iat) {
      Logger.log('warn', 'Refresh token, exp or iat not set.');
      return;
    }

    const timeDiff = exp - iat;

    const now = Math.floor(new Date().getTime() / 1000);

    // If more than half the time till expire has been passed refresh the token.
    if (now > iat + timeDiff / 2) {
      setRefreshingToken(true);
      Logger.log('info', 'Refreshing token.');

      ConfigLoader.loadConfig().then((config) => {
        fetch(config.authenticationRefreshTokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: rToken,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            Logger.log('info', 'Token refreshed.');

            const decodedToken = jwtDecode(data.token);

            localStorage.setItem(lsApiToken, data.token);
            localStorage.setItem(lsApiTokenExpire, decodedToken.exp);
            localStorage.setItem(lsApiTokenIssuedAt, decodedToken.iat);
            localStorage.setItem(lsRefreshToken, data.refresh_token);
          })
          .catch(() => {
            Logger.log('error', 'Token refresh error.');
          })
          .finally(() => {
            setRefreshingToken(false);
          });
      });
    } else {
      Logger.log(
        'info',
        `Half the time until expire has not been reached. Will not refresh. Token will expire at ${new Date(
          exp * 1000
        ).toISOString()}`
      );
    }
  };

  const startContent = (localScreenId) => {
    setRunning(true);

    // Start the content service.
    const newContentService = new ContentService();
    contentServiceRef.current = newContentService;
    newContentService.start();

    const entrypoint = `/v1/screens/${localScreenId}`;

    document.dispatchEvent(
      new CustomEvent('startDataSync', {
        detail: {
          screenPath: entrypoint,
        },
      })
    );

    // Start refresh token interval.
    refreshTokenIntervalRef.current = setInterval(checkToken, refreshTimeout);
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
              data?.refresh_token
            ) {
              const decodedToken = jwtDecode(data.token);

              localStorage.setItem(lsApiToken, data.token);
              localStorage.setItem(lsApiTokenExpire, decodedToken.exp);
              localStorage.setItem(lsApiTokenIssuedAt, decodedToken.iat);
              localStorage.setItem(lsScreenId, data.screenId);
              localStorage.setItem(lsTenantKey, data.tenantKey);
              localStorage.setItem(lsRefreshToken, data.refresh_token);

              startContent(data.screenId);
            } else if (data?.status === 'awaitingBindKey') {
              if (data?.bindKey) {
                setBindKey(data.bindKey);
              }
              timeoutRef.current = setTimeout(refreshLogin, loginCheckTimeout);
            }
          })
          .catch(() => {
            timeoutRef.current = setTimeout(refreshLogin, loginCheckTimeout);
          });
      });
    }
  };

  const reauthenticateHandler = () => {
    Logger.log('info', 'Reauthenticate.');

    localStorage.removeItem(lsApiToken);
    localStorage.removeItem(lsApiTokenExpire);
    localStorage.removeItem(lsApiTokenIssuedAt);
    localStorage.removeItem(lsRefreshToken);
    localStorage.removeItem(lsScreenId);
    localStorage.removeItem(lsTenantKey);

    if (contentServiceRef?.current) {
      contentServiceRef.current.stop();
      contentServiceRef.current = null;
    }

    setScreen(null);
    if (refreshTokenIntervalRef) {
      clearInterval(refreshTokenIntervalRef.current);
    }
    setRunning(false);
    refreshLogin();
  };

  const checkForUpdates = () => {
    Logger.log('info', 'Checking for new release timestamp.');

    ReleaseLoader.loadConfig().then((config) => {
      if (releaseTimestampRef?.current === null) {
        releaseTimestampRef.current = config.releaseTimestamp;
      } else if (releaseTimestampRef?.current !== config.releaseTimestamp) {
        window.location.reload(false);
      }
    });
  };

  useEffect(() => {
    document.addEventListener('screen', screenHandler);
    document.addEventListener('reauthenticate', reauthenticateHandler);

    refreshLogin();

    checkForUpdates();
    releaseTimestampIntervalRef.current = setInterval(
      checkForUpdates,
      releaseTimestampIntervalTimeout
    );

    return function cleanup() {
      document.removeEventListener('screen', screenHandler);
      document.removeEventListener('reauthenticate', reauthenticateHandler);

      if (timeoutRef?.current) {
        clearTimeout(timeoutRef.current);
      }

      if (refreshTokenIntervalRef?.current) {
        clearInterval(refreshTokenIntervalRef.current);
      }

      if (releaseTimestampIntervalRef?.current) {
        clearInterval(releaseTimestampIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      {!screen && bindKey && (
        <div className="bind-key-container">
          <h1 className="bind-key">{bindKey}</h1>
        </div>
      )}
      {screen && <Screen screen={screen} />}
    </div>
  );
}

export default App;
