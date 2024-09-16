import React, { useEffect, useRef, useState } from 'react';
import Screen from './components/screen';
import ContentService from './service/contentService';
import ConfigLoader from './util/config-loader';
import ReleaseLoader from './util/release-loader';
import Logger from './logger/logger';
import './app.scss';
import fallback from './assets/fallback.png';
import idFromPath from './util/id-from-path';
import appStorage from './util/app-storage';

/**
 * App component.
 *
 * @returns {object}
 *   The component.
 */
function App() {
  const fallbackImageUrl = appStorage.getFallbackImageUrl();

  const loginCheckTimeoutDefault = 20 * 1000;
  const refreshTokenTimeoutDefault = 15 * 60 * 1000;
  const releaseTimestampIntervalTimeoutDefault = 1000 * 60 * 10;

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

    const refreshToken = appStorage.getRefreshToken();
    const expire = appStorage.getTokenExpire();
    const issueAt = appStorage.getTokenIssueAt();

    if (!refreshToken || !expire || !issueAt) {
      Logger.log('warn', 'Refresh token, exp or iat not set.');
      return;
    }

    const timeDiff = expire - issueAt;

    const now = Math.floor(new Date().getTime() / 1000);

    // If more than half the time till expire has been passed refresh the token.
    if (now > issueAt + timeDiff / 2) {
      setRefreshingToken(true);
      Logger.log('info', 'Refreshing token.');

      ConfigLoader.loadConfig().then((config) => {
        fetch(`${config.apiEndpoint}/v2/authentication/token/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            Logger.log('info', 'Token refreshed.');

            appStorage.setToken(data.token);
            appStorage.setRefreshToken(data.refresh_token);
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
          expire * 1000
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

    ConfigLoader.loadConfig().then((config) => {
      // Start refresh token interval.
      refreshTokenIntervalRef.current = setInterval(
        checkToken,
        config.refreshTokenTimeout ?? refreshTokenTimeoutDefault
      );
    });
  };

  const checkLogin = () => {
    Logger.log('info', 'Check login.');

    const localStorageToken = appStorage.getToken();
    const localScreenId = appStorage.getScreenId();

    if (!running && localStorageToken && localScreenId) {
      startContent(localScreenId);
    } else {
      ConfigLoader.loadConfig().then((config) => {
        fetch(`${config.apiEndpoint}/v2/authentication/screen`, {
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
              appStorage.setToken(data.token);
              appStorage.setRefreshToken(data.refresh_token);
              appStorage.setScreenId(data.screenId);
              appStorage.setTenant(data.tenantKey, data.tenantId);

              startContent(data.screenId);
            } else if (data?.status === 'awaitingBindKey') {
              if (data?.bindKey) {
                setBindKey(data.bindKey);
              }

              if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
              }

              timeoutRef.current = setTimeout(
                checkLogin,
                config.loginCheckTimeout ?? loginCheckTimeoutDefault
              );
            }
          })
          .catch(() => {
            if (timeoutRef.current !== null) {
              clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(
              checkLogin,
              config.loginCheckTimeout ?? loginCheckTimeoutDefault
            );
          });
      });
    }
  };

  const reauthenticateHandler = () => {
    Logger.log('info', 'Reauthenticate.');

    appStorage.clearToken();
    appStorage.clearRefreshToken();
    appStorage.clearScreenId();
    appStorage.clearTenant();
    appStorage.clearFallbackImageUrl();

    if (contentServiceRef?.current !== null) {
      contentServiceRef.current.stop();
      contentServiceRef.current = null;
    }

    setScreen(null);
    if (refreshTokenIntervalRef.current) {
      clearInterval(refreshTokenIntervalRef.current);
    }
    setRunning(false);

    checkLogin();
  };

  const checkForUpdates = () => {
    Logger.log('info', 'Checking for new release timestamp.');

    ReleaseLoader.loadConfig().then((release) => {
      if (releaseTimestampRef?.current === null) {
        releaseTimestampRef.current = release.releaseTimestamp;
      } else if (releaseTimestampRef?.current !== release.releaseTimestamp) {
        if (
          release.releaseTimestamp !== null &&
          release.releaseVersion !== null
        ) {
          const redirectUrl = new URL(window.location.href);
          redirectUrl.searchParams.set(
            'releaseTimestamp',
            release.releaseTimestamp
          );
          redirectUrl.searchParams.set(
            'releaseVersion',
            release.releaseVersion
          );

          window.location.replace(redirectUrl);
        } else {
          Logger.log(
            'info',
            'Release timestamp or version null, not redirecting.'
          );
        }
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
      appStorage.clearAppStorage();
      window.location.reload();
    }
  };

  useEffect(() => {
    const currentUrl = new URL(window.location.href);

    // Make sure have releaseVersion and releaseTimestamp set in url parameters.
    if (
      !currentUrl.searchParams.has('releaseVersion') ||
      !currentUrl.searchParams.has('releaseTimestamp')
    ) {
      ReleaseLoader.loadConfig().then((release) => {
        if (
          release.releaseTimestamp !== null &&
          release.releaseVersion !== null
        ) {
          currentUrl.searchParams.set(
            'releaseTimestamp',
            release.releaseTimestamp
          );
          currentUrl.searchParams.set('releaseVersion', release.releaseVersion);

          window.history.replaceState(null, '', currentUrl);
        } else {
          Logger.log(
            'info',
            'Release timestamp or version null, not setting query parameters.'
          );
        }
      });
    }

    document.addEventListener('screen', screenHandler);
    document.addEventListener('reauthenticate', reauthenticateHandler);
    document.addEventListener('contentEmpty', contentEmpty);
    document.addEventListener('contentNotEmpty', contentNotEmpty);
    document.addEventListener('keypress', handleKeyboard);

    checkLogin();

    checkForUpdates();

    ConfigLoader.loadConfig().then((config) => {
      releaseTimestampIntervalRef.current = setInterval(
        checkForUpdates,
        config.releaseTimestampIntervalTimeout ??
          releaseTimestampIntervalTimeoutDefault
      );
    });

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
    // Append screenId to current url for easier debugging. If errors are logged in the API's standard http log this
    // makes it easy to see what screen client has made the http call by putting the screen id in the referer http
    // header.
    if (screen && screen['@id']) {
      const url = new URL(window.location.href);
      url.searchParams.set('screenId', idFromPath(screen['@id']));
      window.history.replaceState(null, '', url);
    }

    ConfigLoader.loadConfig().then((config) => {
      const token = appStorage.getToken();
      const tenantKey = appStorage.getTenantKey();
      const tenantId = appStorage.getTenantId();

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
            if (tenantData?.fallbackImageUrl) {
              appStorage.setFallbackImageUrl(tenantData.fallbackImageUrl);
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
