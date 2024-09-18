import logger from '../logger/logger';
import appStorage from '../util/app-storage';
import ConfigLoader from '../util/config-loader';
import defaults from '../util/defaults';
import statusService from './statusService';
import { errorCodes } from '../util/status';

class TokenService {
  refreshingToken = false;

  refreshInterval = null;

  refreshPromise = null;

  ensureFreshToken = () => {
    logger.info('Refresh token check');

    // Ignore if already refreshing token.
    if (this.refreshingToken) {
      logger.info('Already refreshing token.');
      return;
    }

    const refreshToken = appStorage.getRefreshToken();
    const expire = appStorage.getTokenExpire();
    const issueAt = appStorage.getTokenIssueAt();

    if (!refreshToken || !expire || !issueAt) {
      logger.warn('Refresh token, exp or iat not set.');
      statusService.setError(errorCodes.ERROR_TOKEN_EXP_IAT_NOT_SET);
      return;
    }

    const timeDiff = expire - issueAt;

    const nowSeconds = Math.floor(new Date().getTime() / 1000);

    // If more than half the time till expire has been passed refresh the token.
    if (nowSeconds > issueAt + timeDiff / 2) {
      logger.info('Refreshing token.');
      this.refreshToken().catch(() => {
        statusService.setError(errorCodes.ERROR_TOKEN_REFRESH_LOOP_FAILED);
      });
    } else {
      logger.info(
        `Half the time until expire has not been reached. Will not refresh. Token will expire at ${new Date(
          expire * 1000
        ).toISOString()}`
      );
    }
  };

  refreshToken = () => {
    logger.info('Refresh token invoked.');

    if (this.refreshPromise === null) {
      this.refreshPromise = new Promise((resolve, reject) => {
        const refreshToken = appStorage.getRefreshToken();
        this.refreshingToken = true;

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
              logger.info('Token refreshed.');

              appStorage.setToken(data.token);
              appStorage.setRefreshToken(data.refresh_token);
              resolve();
            })
            .catch((err) => {
              logger.error('Token refresh error.');
              reject(err);
            })
            .finally(() => {
              this.refreshingToken = false;
              this.refreshPromise = null;
            });
        });
      });
    }

    return this.refreshPromise;
  };

  startRefreshing = () => {
    ConfigLoader.loadConfig().then((config) => {
      // Start refresh token interval.
      this.refreshInterval = setInterval(
        this.ensureFreshToken,
        config.refreshTokenTimeout ?? defaults.refreshTokenTimeoutDefault
      );
    });
  };

  stopRefreshing = () => {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  };
}

// Singleton.
const tokenService = new TokenService();

export default tokenService;
