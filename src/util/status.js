const statusCodes = {
  INIT: 'init',
  LOGIN: 'login',
  RUNNING: 'running',
};

const errorCodes = {
  ERROR_TOKEN_REFRESH_FAILED: 'ER101', // Api returns 401. Token could not be refreshed.
  ERROR_TOKEN_REFRESH_LOOP_FAILED: 'ER102', // Token could not be refreshed in normal refresh token loop.
  ERROR_TOKEN_EXP_IAT_NOT_SET: 'ER103', // Token refresh aborted, refresh token, iat and/or exp not set.
  ERROR_RELEASE_FILE_NOT_LOADED: 'ER104', // Release file could not be loaded.
  ERROR_TOKEN_EXPIRED: 'ER105', // Token is expired.
  ERROR_TOKEN_VALID_SHOULD_HAVE_BEEN_REFRESHED: 'ER106', // Token is valid but should have been refreshed.
};

export { statusCodes, errorCodes };
