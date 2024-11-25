const constants = {
  LOGIN_STATUS_READY: 'ready',
  LOGIN_STATUS_AWAITING_BIND_KEY: 'awaitingBindKey',
  LOGIN_STATUS_UNKNOWN: 'unknown',
  TOKEN_EXPIRED: 'Expired',
  TOKEN_VALID_SHOULD_HAVE_BEEN_REFRESHED: 'ValidShouldHaveBeenRefreshed',
  TOKEN_VALID: 'Valid',
  STATUS_INIT: 'init',
  STATUS_LOGIN: 'login',
  STATUS_RUNNING: 'running',
  ERROR_TOKEN_REFRESH_FAILED: 'ER101', // Api returns 401. Token could not be refreshed.
  ERROR_TOKEN_REFRESH_LOOP_FAILED: 'ER102', // Token could not be refreshed in normal refresh token loop.
  ERROR_TOKEN_EXP_IAT_NOT_SET: 'ER103', // Token refresh aborted, refresh token, iat and/or exp not set.
  ERROR_RELEASE_FILE_NOT_LOADED: 'ER104', // Release file could not be loaded.
  ERROR_TOKEN_EXPIRED: 'ER105', // Token is expired.
  ERROR_TOKEN_VALID_SHOULD_HAVE_BEEN_REFRESHED: 'ER106', // Token is valid but should have been refreshed.
  NO_TOKEN: 'NO_TOKEN',
  NO_EXPIRE: 'NO_EXPIRE',
  NO_ISSUED_AT: 'NO_ISSUED_AT',
};

export default constants;
