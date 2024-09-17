import logger from "../logger/logger.js";
import appStorage from "../util/app-storage.js";
import ConfigLoader from "../util/config-loader.js";
import defaults from "../util/defaults.js";

class TokenService {
  refreshingToken = false;
  refreshInterval = null;
  refreshPromise = null;

  ensureFreshToken = () => {
    logger.info("Refresh token check");

    // Ignore if already refreshing token.
    if (this.refreshingToken) {
      logger.info("Already refreshing token.");
      return;
    }

    const refreshToken = appStorage.getRefreshToken();
    const expire = appStorage.getTokenExpire();
    const issueAt = appStorage.getTokenIssueAt();

    if (!refreshToken || !expire || !issueAt) {
      logger.warn('Refresh token, exp or iat not set.');
      return;
    }

    const timeDiff = expire - issueAt;

    const nowSeconds = Math.floor(new Date().getTime() / 1000);

    // If more than half the time till expire has been passed refresh the token.
    if (nowSeconds > issueAt + timeDiff / 2) {
      logger.info("Refreshing token.");
      this.refreshToken();
    } else {
      logger.info(
        `Half the time until expire has not been reached. Will not refresh. Token will expire at ${new Date(
          expire * 1000
        ).toISOString()}`
      );
    }
  };

  refreshToken = () => {
    logger.info("Refresh token invoked.");

    if (this.refreshPromise === null) {
      this.refreshPromise = new Promise((resolve, reject) => {
        const refreshToken = appStorage.getRefreshToken();
        this.refreshingToken = true;

        ConfigLoader.loadConfig().then((config) => {
          fetch(`${config.apiEndpoint}/v2/authentication/token/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              logger.info("Token refreshed.");

              appStorage.setToken(data.token);
              appStorage.setRefreshToken(data.refresh_token);
              resolve();
            })
            .catch(() => {
              logger.error("Token refresh error.");
              reject("Token refresh error.");
            })
            .finally(() => {
              this.refreshingToken = false;
              this.refreshPromise = null;
            });
        });
      });
    }

    return this.refreshPromise;
  }

  startRefreshing = () => {
    ConfigLoader.loadConfig().then((config) => {
      // Start refresh token interval.
      this.refreshInterval = setInterval(
        tokenService.ensureFreshToken,
        config.refreshTokenTimeout ?? defaults.refreshTokenTimeoutDefault
      );
    });
  }

  stopRefreshing = () => {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

const tokenService = new TokenService();

export default tokenService;
