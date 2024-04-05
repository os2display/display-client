import jwtDecode from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import Screen from './screen';
import ContentService from './service/contentService';
import ConfigLoader from './config-loader';
import ReleaseLoader from './release-loader';
import Logger from './logger/logger';
import './app.scss';
import localStorageKeys from './local-storage-keys';
import fallback from './assets/fallback.png';

/**
 * App component.
 *
 * @returns {object}
 *   The component.
 */
function App() {
  const fallbackImageUrl = localStorage.getItem(
    localStorageKeys.FALLBACK_IMAGE
  );

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
  const [displayFallback, setDisplayFallback] = useState(true);
  const [debug, setDebug] = useState(false);

  const fallbackStyle = {};

  fallbackStyle.backgroundImage = `url("${
    fallbackImageUrl !== null ? fallbackImageUrl : fallback
  }")`;

  const appStyle = {};

  if (!debug) {
    appStyle.cursor = 'none';
  }

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

    const rToken = localStorage.getItem(localStorageKeys.REFRESH_TOKEN);
    const exp = parseInt(
      localStorage.getItem(localStorageKeys.API_TOKEN_EXPIRE),
      10
    );
    const iat = parseInt(
      localStorage.getItem(localStorageKeys.API_TOKEN_ISSUED_AT),
      10
    );

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

            localStorage.setItem(localStorageKeys.API_TOKEN, data.token);
            localStorage.setItem(
              localStorageKeys.API_TOKEN_EXPIRE,
              decodedToken.exp
            );
            localStorage.setItem(
              localStorageKeys.API_TOKEN_ISSUED_AT,
              decodedToken.iat
            );
            localStorage.setItem(
              localStorageKeys.REFRESH_TOKEN,
              data.refresh_token
            );
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
    Logger.log('info', 'Starting content.');

    if (contentServiceRef.current !== null) {
      return;
    }

    setBindKey(null);
    setRunning(true);

    contentServiceRef.current = new ContentService();

    // Start the content service.
    contentServiceRef.current.start();

    const entrypoint = `/v2/screens/${localScreenId}`;

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

  const checkLogin = () => {
    Logger.log('info', 'Check login.');

    const localStorageToken = localStorage.getItem(localStorageKeys.API_TOKEN);
    const localScreenId = localStorage.getItem(localStorageKeys.SCREEN_ID);

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

              localStorage.setItem(localStorageKeys.API_TOKEN, data.token);
              localStorage.setItem(
                localStorageKeys.API_TOKEN_EXPIRE,
                decodedToken.exp
              );
              localStorage.setItem(
                localStorageKeys.API_TOKEN_ISSUED_AT,
                decodedToken.iat
              );
              localStorage.setItem(localStorageKeys.SCREEN_ID, data.screenId);
              localStorage.setItem(
                localStorageKeys.REFRESH_TOKEN,
                data.refresh_token
              );
              localStorage.setItem(localStorageKeys.TENANT_KEY, data.tenantKey);
              localStorage.setItem(localStorageKeys.TENANT_ID, data.tenantId);

              startContent(data.screenId);
            } else if (data?.status === 'awaitingBindKey') {
              if (data?.bindKey) {
                setBindKey(data.bindKey);
              }

              if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
              }

              timeoutRef.current = setTimeout(checkLogin, loginCheckTimeout);
            }
          })
          .catch(() => {
            if (timeoutRef.current !== null) {
              clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(checkLogin, loginCheckTimeout);
          });
      });
    }
  };

  const reauthenticateHandler = () => {
    Logger.log('info', 'Reauthenticate.');

    localStorage.removeItem(localStorageKeys.API_TOKEN);
    localStorage.removeItem(localStorageKeys.API_TOKEN_EXPIRE);
    localStorage.removeItem(localStorageKeys.API_TOKEN_ISSUED_AT);
    localStorage.removeItem(localStorageKeys.REFRESH_TOKEN);
    localStorage.removeItem(localStorageKeys.SCREEN_ID);
    localStorage.removeItem(localStorageKeys.TENANT_KEY);
    localStorage.removeItem(localStorageKeys.TENANT_ID);
    localStorage.removeItem(localStorageKeys.FALLBACK_IMAGE);

    if (contentServiceRef?.current !== null) {
      contentServiceRef.current.stop();
      contentServiceRef.current = null;
    }

    setScreen(null);
    if (refreshTokenIntervalRef) {
      clearInterval(refreshTokenIntervalRef.current);
    }
    setRunning(false);

    checkLogin();
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

  const contentEmpty = () => {
    Logger.log('info', 'Content empty. Displaying fallback.');
    setDisplayFallback(true);
  };

  const contentNotEmpty = () => {
    Logger.log('info', 'Content not empty. Displaying content.');
    setDisplayFallback(false);
  };

  // ctrl/cmd i will log screen out and refresh
  const handleKeyboard = ({ repeat, metaKey, ctrlKey, code }) => {
    if (!repeat && (metaKey || ctrlKey) && code === 'KeyI') {
      localStorage.clear();
      window.location.reload(false);
    }
  };

  useEffect(() => {
    document.addEventListener('screen', screenHandler);
    document.addEventListener('reauthenticate', reauthenticateHandler);
    document.addEventListener('contentEmpty', contentEmpty);
    document.addEventListener('contentNotEmpty', contentNotEmpty);
    document.addEventListener('keypress', handleKeyboard);

    checkLogin();

    checkForUpdates();

    releaseTimestampIntervalRef.current = setInterval(
      checkForUpdates,
      releaseTimestampIntervalTimeout
    );

    return function cleanup() {
      Logger.log('info', 'Unmounting App.');

      document.removeEventListener('keypress', handleKeyboard);
      document.removeEventListener('screen', screenHandler);
      document.removeEventListener('reauthenticate', reauthenticateHandler);
      document.removeEventListener('contentEmpty', contentEmpty);
      document.removeEventListener('contentNotEmpty', contentNotEmpty);

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

  useEffect(() => {
    ConfigLoader.loadConfig().then((config) => {
      const token = localStorage.getItem(localStorageKeys.API_TOKEN);
      const tenantKey = localStorage.getItem(localStorageKeys.TENANT_KEY);
      const tenantId = localStorage.getItem(localStorageKeys.TENANT_ID);

      // Make api endpoint available through localstorage.
      localStorage.setItem(localStorageKeys.API_URL, config.apiEndpoint);

      if (token && tenantKey && tenantId) {
        // Get fallback image.
        fetch(`${config.apiEndpoint}/v2/tenants/${tenantId}`, {
          headers: {
            authorization: `Bearer ${token}`,
            'Authorization-Tenant-Key': tenantKey,
          },
        })
          .then((response) => response.json())
          .then((tenantData) => {
            if (tenantData.fallbackImageUrl) {
              localStorage.setItem(
                localStorageKeys.FALLBACK_IMAGE,
                tenantData.fallbackImageUrl
              );
            }
          });
      }

      setDebug(config?.debug ?? false);
    });
  }, [screen]);

  return (
    <div className="app" style={appStyle}>
      {!screen && bindKey && (
        <div className="bind-key-container">
          <h1 className="bind-key">{bindKey}</h1>
        </div>
      )}
      {screen && (
        <>
          <Screen screen={screen} />
        </>
      )}
      {displayFallback && !bindKey && (
        <div className="fallback" style={fallbackStyle} />
      )}
    </div>
  );
}

export default App;
