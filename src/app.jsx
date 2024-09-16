import React, { useEffect, useRef, useState } from 'react';
import Screen from './components/screen';
import ContentService from './service/content-service';
import ConfigLoader from './util/config-loader';
import logger from './logger/logger';
import './app.scss';
import fallback from './assets/fallback.png';
import appStorage from './util/app-storage';
import defaults from './util/defaults';
import tokenService from "./service/token-service.js";
import releaseService from "./service/release-service.js";
import tenantService from "./service/tenant-service.js";

/**
 * App component.
 *
 * @returns {object}
 *   The component.
 */
function App() {
  const [running, setRunning] = useState(false);
  const [screen, setScreen] = useState("");
  const [bindKey, setBindKey] = useState(null);
  const [displayFallback, setDisplayFallback] = useState(true);

  const checkLoginTimeoutRef = useRef(null);
  const contentServiceRef = useRef(null);

  const debug = appStorage.getDebug();

  const fallbackImageUrl = appStorage.getFallbackImageUrl();
  const fallbackStyle = {};

  fallbackStyle.backgroundImage = `url("${
    fallbackImageUrl !== null ? fallbackImageUrl : fallback
  }")`;

  const appStyle = {};

  if (!debug) {
    appStyle.cursor = "none";
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

  const startContent = (localScreenId) => {
    logger.info("Starting content.");

    if (contentServiceRef.current !== null) {
      logger.warn("ContentServiceRef is not null.");
      return;
    }

    setBindKey(null);
    setRunning(true);

    contentServiceRef.current = new ContentService();

    // Start the content service.
    contentServiceRef.current.start();

    const entrypoint = `/v2/screens/${localScreenId}`;

    document.dispatchEvent(
      new CustomEvent("startDataSync", {
        detail: {
          screenPath: entrypoint,
        },
      })
    );

    tokenService.startRefreshing();
  };

  const checkLogin = () => {
    logger.info("Check login.");

    const localStorageToken = appStorage.getToken();
    const localScreenId = appStorage.getScreenId();

    if (!running && localStorageToken && localScreenId) {
      startContent(localScreenId);
    } else {
      ConfigLoader.loadConfig().then((config) => {
        fetch(`${config.apiEndpoint}/v2/authentication/screen`, {
          method: "POST",
          mode: "cors",
          credentials: "include",
        })
          .then((response) => response.json())
          .then((data) => {
            if (
              data?.status === "ready" &&
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
            } else if (data?.status === "awaitingBindKey") {
              if (data?.bindKey) {
                setBindKey(data.bindKey);
              }

              if (checkLoginTimeoutRef.current !== null) {
                clearTimeout(checkLoginTimeoutRef.current);
              }

              checkLoginTimeoutRef.current = setTimeout(
                checkLogin,
                config.loginCheckTimeout ?? defaults.loginCheckTimeoutDefault
              );
            }
          })
          .catch(() => {
            if (checkLoginTimeoutRef.current !== null) {
              clearTimeout(checkLoginTimeoutRef.current);
            }

            checkLoginTimeoutRef.current = setTimeout(
              checkLogin,
              config.loginCheckTimeout ?? defaults.loginCheckTimeoutDefault
            );
          });
      });
    }
  };

  const reauthenticateHandler = () => {
    logger.info("Reauthenticate.");

    // TODO: Check if we can get a new token from refresh token.

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
    setRunning(false);

    tokenService.stopRefreshing();

    checkLogin();
  };

  const contentEmpty = () => {
    logger.info("Content empty. Displaying fallback.");
    setDisplayFallback(true);
  };

  const contentNotEmpty = () => {
    logger.info("Content not empty. Displaying content.");
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
    releaseService.setCurrentReleaseInUrl();
    releaseService.checkForUpdates();
    releaseService.startReleaseCheck();

    document.addEventListener("screen", screenHandler);
    document.addEventListener("reauthenticate", reauthenticateHandler);
    document.addEventListener("contentEmpty", contentEmpty);
    document.addEventListener("contentNotEmpty", contentNotEmpty);
    document.addEventListener("keypress", handleKeyboard);

    checkLogin();

    return function cleanup() {
      logger.info("Unmounting App.");

      document.removeEventListener("keypress", handleKeyboard);
      document.removeEventListener("screen", screenHandler);
      document.removeEventListener("reauthenticate", reauthenticateHandler);
      document.removeEventListener("contentEmpty", contentEmpty);
      document.removeEventListener("contentNotEmpty", contentNotEmpty);

      if (checkLoginTimeoutRef?.current) {
        clearTimeout(checkLoginTimeoutRef.current);
      }

      tokenService.stopRefreshing();

      releaseService.stopReleaseCheck();
    };
  }, []);

  useEffect(() => {
    if (screen && screen["@id"]) {
      releaseService.setScreenIdInUrl(screen['@id']);
      tenantService.loadTenantConfig();
    }
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
