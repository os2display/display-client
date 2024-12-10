import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Screen from "./components/screen";
import ContentService from "./service/content-service";
import ConfigLoader from "./util/config-loader";
import logger from "./logger/logger";
import "./app.scss";
import fallback from "./assets/fallback.png";
import appStorage from "./util/app-storage";
import defaults from "./util/defaults";
import tokenService from "./service/token-service";
import releaseService from "./service/release-service";
import tenantService from "./service/tenant-service";
import statusService from "./service/status-service";
import constants from "./util/constants";

/**
 * App component.
 *
 * @param {object} props The props.
 * @param {string | null} props.preview Type of preview to enable.
 * @param {string | null} props.previewId The id of the entity to preview.
 * @returns {object}
 *   The component.
 */
function App({ preview, previewId }) {
  const [running, setRunning] = useState(false);
  const [screen, setScreen] = useState("");
  const [bindKey, setBindKey] = useState(null);
  const [displayFallback, setDisplayFallback] = useState(true);
  const [debug, setDebug] = useState(false);

  const checkLoginTimeoutRef = useRef(null);
  const contentServiceRef = useRef(null);

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

    statusService.setStatus(constants.STATUS_RUNNING);

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

  /* eslint-disable no-use-before-define */
  const restartLoginTimeout = () => {
    if (checkLoginTimeoutRef.current !== null) {
      clearTimeout(checkLoginTimeoutRef.current);
    }

    ConfigLoader.loadConfig().then((config) => {
      checkLoginTimeoutRef.current = setTimeout(
        checkLogin,
        config.loginCheckTimeout ?? defaults.loginCheckTimeoutDefault
      );
    });
  };
  /* eslint-enable no-use-before-define */

  const checkLogin = () => {
    logger.info("Check login.");

    const localStorageToken = appStorage.getToken();
    const localScreenId = appStorage.getScreenId();

    if (!running && localStorageToken && localScreenId) {
      startContent(localScreenId);
    } else {
      statusService.setStatus(constants.STATUS_LOGIN);

      tokenService
        .checkLogin()
        .then((data) => {
          if (data.status === constants.LOGIN_STATUS_READY) {
            startContent(data.screenId);
          } else if (data.status === constants.LOGIN_STATUS_AWAITING_BIND_KEY) {
            if (data?.bindKey) {
              setBindKey(data.bindKey);
            }

            restartLoginTimeout();
          }
        })
        .catch(() => {
          restartLoginTimeout();
        });
    }
  };

  const reauthenticateHandler = () => {
    logger.info("Reauthenticate handler invoked. Trying to use refresh token.");

    tokenService
      .refreshToken()
      .then(() => {
        logger.info("Reauthenticate refresh token success");
      })
      .catch(() => {
        logger.warn("Reauthenticate refresh token failed. Logging out.");

        statusService.setError(constants.ERROR_TOKEN_REFRESH_FAILED);

        document.dispatchEvent(new Event("stopDataSync"));

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
      });
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
    if (!repeat && (metaKey || ctrlKey) && code === "KeyI") {
      appStorage.clearAppStorage();
      window.location.reload();
    }
  };

  useEffect(() => {
    logger.info("Mounting App.");
    if (preview !== null) {
      document.addEventListener("screen", screenHandler);
      document.addEventListener("contentEmpty", contentEmpty);
      document.addEventListener("contentNotEmpty", contentNotEmpty);

      if (preview === "screen") {
        startContent(previewId);
        return;
      }
      setRunning(true);
      contentServiceRef.current = new ContentService();
      contentServiceRef.current.start();
      document.dispatchEvent(
        new CustomEvent("startPreview", {
          detail: {
            mode: preview,
            id: previewId,
          },
        })
      );
    } else {
      document.addEventListener("keypress", handleKeyboard);
      document.addEventListener("screen", screenHandler);
      document.addEventListener("reauthenticate", reauthenticateHandler);
      document.addEventListener("contentEmpty", contentEmpty);
      document.addEventListener("contentNotEmpty", contentNotEmpty);

      tokenService.checkToken();

      ConfigLoader.loadConfig().then((config) => {
        setDebug(config.debug ?? false);
      });

      releaseService.checkForNewRelease().finally(() => {
        releaseService.setPreviousBootInUrl();
        releaseService.startReleaseCheck();

        checkLogin();

        appStorage.setPreviousBoot(new Date().getTime());
      });

      statusService.setStatusInUrl();
    }

    /* eslint-disable-next-line consistent-return */
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
      releaseService.setScreenIdInUrl(screen["@id"]);
      tenantService.loadTenantConfig();
    }
  }, [screen]);

  return (
    <div className="app" style={appStyle}>
      {!screen && bindKey && (
        <>
          {statusService.error && (
            <h2 className="frontpage-error">{statusService.error}</h2>
          )}
          <div className="bind-key-container">
            <h1 className="bind-key">{bindKey}</h1>
          </div>
        </>
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

App.propTypes = {
  preview: PropTypes.string,
  previewId: PropTypes.string,
};

export default App;
